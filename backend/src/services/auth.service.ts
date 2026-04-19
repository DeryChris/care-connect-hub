// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const SALT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  designation: string;
  permissions: string[];
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function validatePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload as object, process.env.JWT_SECRET as string, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload as object, process.env.JWT_REFRESH_SECRET as string, options);
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
}

export function buildTokenPayload(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  designation: string;
  permissions: string[];
}): TokenPayload {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'admin' | 'user',
    designation: user.designation,
    permissions: user.permissions,
  };
}

export async function storeRefreshToken(userId: string, token: string) {
  const hashed = await bcrypt.hash(token, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { refresh_token: hashed },
  });
}

export async function clearRefreshToken(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refresh_token: null },
  });
}