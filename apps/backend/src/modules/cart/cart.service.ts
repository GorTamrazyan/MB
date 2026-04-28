import { redis } from '../../config/redis';
import { CartItem, ItemType } from '@tina/shared';
import { NotFoundError } from '../../lib/errors';
import { prisma } from '../../config/database';

function cartKey(userId: string) {
  return `cart:${userId}`;
}

export async function getCart(userId: string): Promise<CartItem[]> {
  const raw = await redis.get(cartKey(userId));
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function addItem(userId: string, item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const items = await getCart(userId);
  const existing = items.findIndex(i => i.id === item.id && i.type === item.type);
  if (existing >= 0) {
    items[existing].quantity += item.quantity || 1;
  } else {
    items.push({ ...item, quantity: item.quantity || 1 });
  }
  await redis.set(cartKey(userId), JSON.stringify(items));
  return items;
}

export async function updateItem(userId: string, itemId: string, quantity: number) {
  const items = await getCart(userId);
  const idx = items.findIndex(i => i.id === itemId);
  if (idx < 0) throw new NotFoundError('Cart item not found');
  if (quantity <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].quantity = quantity;
  }
  await redis.set(cartKey(userId), JSON.stringify(items));
  return items;
}

export async function removeItem(userId: string, itemId: string) {
  const items = await getCart(userId);
  const filtered = items.filter(i => i.id !== itemId);
  await redis.set(cartKey(userId), JSON.stringify(filtered));
  return filtered;
}

export async function clearCart(userId: string) {
  await redis.del(cartKey(userId));
}

export async function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export async function validateCart(items: CartItem[]): Promise<CartItem[]> {
  const validated: CartItem[] = [];
  for (const item of items) {
    if (item.type === ItemType.SERVICE) {
      const service = await prisma.service.findUnique({ where: { id: item.id } });
      if (!service || !service.isActive) continue;
      validated.push({ ...item, price: Number(service.price) });
    } else {
      const pkg = await prisma.package.findUnique({ where: { id: item.id } });
      if (!pkg || !pkg.isActive) continue;
      validated.push({ ...item, price: Number(pkg.finalPrice) });
    }
  }
  return validated;
}
