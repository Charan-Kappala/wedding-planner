import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

const prisma = new PrismaClient();

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`${key} environment variable not set`);
  return val;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret('JWT_SECRET'), { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), { expiresIn: REFRESH_TOKEN_TTL });
}

export async function registerUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      wedding: { create: {} },
    },
    select: { id: true, email: true, createdAt: true },
  });

  const payload: JwtPayload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const payload: JwtPayload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pwd, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token revoked or expired', 401);
  }

  const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
  return { accessToken: newAccessToken };
}

export async function logoutUser(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}
