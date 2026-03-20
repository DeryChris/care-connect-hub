// src/controllers/search.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ok, badRequest } from '../lib/response';

export async function globalSearch(req: Request, res: Response) {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return badRequest(res, 'Search query must be at least 2 characters');

  const search = { contains: q, mode: 'insensitive' as const };

  const [knowledge, patients, users, appointments, labTests] = await Promise.all([
    prisma.knowledgeArticle.findMany({
      where: { OR: [{ title: search }, { content: search }], status: 'approved' },
      take: 5,
      select: { id: true, title: true, category: true, content: true },
    }),
    prisma.patient.findMany({
      where: { OR: [{ name: search }, { phone: search }], is_active: true },
      take: 3,
      select: { id: true, name: true, phone: true, date_of_birth: true },
    }),
    prisma.user.findMany({
      where: { OR: [{ name: search }, { email: search }], is_active: true },
      take: 3,
      select: { id: true, name: true, designation: true, email: true, role: true },
    }),
    prisma.appointment.findMany({
      where: { OR: [{ patient_name: search }, { doctor_name: search }] },
      take: 3,
      select: { id: true, patient_name: true, doctor_name: true, appointment_date: true, status: true },
    }),
    prisma.laboratoryTest.findMany({
      where: { OR: [{ patient_name: search }, { test_name: search }] },
      take: 3,
      select: { id: true, patient_name: true, test_name: true, status: true, ordered_by_name: true },
    }),
  ]);

  const results = [
    ...knowledge.map(a => ({ id: a.id, title: a.title, type: 'knowledge', category: a.category, excerpt: a.content.substring(0, 100) + '...', url: `/knowledge/${a.id}` })),
    ...patients.map(p => ({ id: p.id, title: p.name, type: 'patient', excerpt: `DOB: ${p.date_of_birth} | ${p.phone}`, url: `/patients/${p.id}` })),
    ...users.map(u => ({ id: u.id, title: u.name, type: 'user', category: u.designation, excerpt: `${u.role} | ${u.email}`, url: `/users/${u.id}` })),
    ...appointments.map(a => ({ id: a.id, title: `${a.patient_name} - ${a.doctor_name}`, type: 'appointment', excerpt: `${a.appointment_date} ${a.status}`, url: `/appointments/${a.id}` })),
    ...labTests.map(t => ({ id: t.id, title: `${t.patient_name} - ${t.test_name}`, type: 'labtest', excerpt: `${t.status} | ${t.ordered_by_name}`, url: `/laboratory/${t.id}` })),
  ].slice(0, 8);

  return ok(res, results);
}
