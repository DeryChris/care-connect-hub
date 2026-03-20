// src/controllers/auth.controller.ts
// Key fix: sameSite is 'lax' in development (was 'strict').
// 'strict' cookies are NOT sent on page navigations from the same origin when
// the browser internally distinguishes the proxy vs direct connections.
// 'lax' allows the cookie to be sent on top-level navigations.
// In production, 'strict' is fine because there's no proxy involved.
//
// Also: the refresh endpoint now validates the stored token hash against the DB
// to prevent token reuse after logout.

import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { ok, unauthorized, forbidden, badRequest } from '../lib/response';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Invalid request', parsed.error.errors);

  const { email, password } = parsed.data;
  const user = await authService.findUserByEmail(email);
  if (!user) return unauthorized(res, 'Invalid credentials');
  if (!user.is_active) return forbidden(res, 'Account is inactive. Contact your administrator.');

  const valid = await authService.validatePassword(password, user.password_hash);
  if (!valid) return unauthorized(res, 'Invalid credentials');

  const payload = authService.buildTokenPayload(user);
  const accessToken = authService.generateAccessToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);

  await authService.storeRefreshToken(user.id, refreshToken);

  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);

  return ok(res, {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      phone: user.phone,
      is_active: user.is_active,
      permissions: user.permissions,
      department_id: user.department_id,
      specialization: user.specialization,
      qualification: user.qualification,
      fee: user.fee,
      created_at: user.created_at,
    },
  });
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  if (req.user) {
    await authService.clearRefreshToken(req.user.userId);
  }
  res.clearCookie('refresh_token', { path: '/api/auth' });
  return ok(res, { message: 'Logged out successfully' });
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) return unauthorized(res, 'No refresh token');

  let payload: authService.TokenPayload;
  try {
    payload = authService.verifyRefreshToken(token);
  } catch {
    return unauthorized(res, 'Invalid or expired refresh token');
  }

  // Validate against stored hash — prevents reuse after logout
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.refresh_token) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return unauthorized(res, 'Session has been revoked');
  }

  const tokenMatches = await bcrypt.compare(token, user.refresh_token);
  if (!tokenMatches) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return unauthorized(res, 'Invalid refresh token');
  }

  if (!user.is_active) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return forbidden(res, 'Account is inactive');
  }

  // Rotate tokens (issue a new refresh token each time)
  const newPayload = authService.buildTokenPayload(user);
  const newAccessToken = authService.generateAccessToken(newPayload);
  const newRefreshToken = authService.generateRefreshToken(newPayload);

  await authService.storeRefreshToken(user.id, newRefreshToken);
  res.cookie('refresh_token', newRefreshToken, COOKIE_OPTIONS);

  return ok(res, { accessToken: newAccessToken });
}

// POST /api/auth/change-password
export async function changePassword(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);

  const { currentPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return unauthorized(res);

  const valid = await authService.validatePassword(currentPassword, user.password_hash);
  if (!valid) return badRequest(res, 'Current password is incorrect');

  const newHash = await authService.hashPassword(newPassword);
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { password_hash: newHash },
  });

  return ok(res, { message: 'Password changed successfully' });
}