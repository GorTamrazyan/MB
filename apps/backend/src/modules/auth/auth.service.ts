import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors';
import { RegisterInput, LoginInput } from '@tina/shared';

function generateAccessToken(userId: string, role: string, email: string): string {
  return jwt.sign({ userId, role, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
  const token = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, hash, expiresAt };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role as any,
      verificationToken,
      profile: { create: {} },
    },
    include: { profile: true },
  });

  return { user };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  if (!user.isActive) throw new UnauthorizedError('Account is suspended');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const accessToken = generateAccessToken(user.id, user.role, user.email);
  const { token: refreshToken, hash, expiresAt } = generateRefreshToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hash, refreshTokenExpiresAt: expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function refreshTokens(token: string) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      refreshTokenHash: hash,
      refreshTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) throw new UnauthorizedError('Invalid or expired refresh token');

  const accessToken = generateAccessToken(user.id, user.role, user.email);
  const { token: newRefreshToken, hash: newHash, expiresAt } = generateRefreshToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newHash, refreshTokenExpiresAt: expiresAt },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
  });
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) throw new NotFoundError('Invalid verification token');

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null },
  });
}
