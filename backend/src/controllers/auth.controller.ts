// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { ok, unauthorized, forbidden, badRequest, serverError } from '../lib/response';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, 'Invalid request', parsed.error.errors);
  }

  const { email, password } = parsed.data;

  const user = await authService.findUserByEmail(email);
  if (!user) return unauthorized(res, 'Invalid credentials');
  if (!user.is_active) return forbidden(res, 'Account is inactive. Contact your administrator.');

  const valid = await authService.validatePassword(password, user.password_hash);
  if (!valid) return unauthorized(res, 'Invalid credentials');

  const payload = authService.buildTokenPayload(user);
  const accessToken = authService.generateAccessToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);

  // Store refresh token hash server-side
  await authService.storeRefreshToken(user.id, refreshToken);

  // Set refresh token as httpOnly cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });

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

  try {
    const payload = authService.verifyRefreshToken(token);

    // Re-generate access token
    const newAccessToken = authService.generateAccessToken(payload);
    const newRefreshToken = authService.generateRefreshToken(payload);

    await authService.storeRefreshToken(payload.userId, newRefreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return ok(res, { accessToken: newAccessToken });
  } catch {
    return unauthorized(res, 'Invalid or expired refresh token');
  }
}

// POST /api/auth/change-password  (requires authenticate middleware)
export async function changePassword(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, 'Validation failed', parsed.error.errors);

  const { currentPassword, newPassword } = parsed.data;

  const { prisma } = await import('../lib/prisma');
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
