import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { Response } from 'express';

const sseClients: Map<string, Response> = new Map();

export function registerSSEClient(userId: string, res: Response) {
  sseClients.set(userId, res);
  const sub = redis.duplicate();
  sub.subscribe(`notifications:${userId}`);
  sub.on('message', (channel, message) => {
    res.write(`data: ${message}\n\n`);
  });
  res.on('close', () => {
    sseClients.delete(userId);
    sub.unsubscribe();
    sub.quit();
  });
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, data },
  });

  await redis.publish(`notifications:${userId}`, JSON.stringify(notification));
  return notification;
}

export async function getNotifications(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [data, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { data, total, unread, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function markRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
