// src/controllers/settings.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, badRequest } from '../lib/response';

export async function list(_req: Request, res: Response) {
  const settings = await prisma.systemSetting.findMany();
  const obj = settings.reduce((acc: Record<string, string>, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  return ok(res, obj);
}

export async function update(req: Request, res: Response) {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) return badRequest(res, 'value is required');
  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
  return ok(res, setting);
}
