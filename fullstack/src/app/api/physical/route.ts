import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/config';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ data: [] });
  const data = await db.physicalEntry.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const created = await db.physicalEntry.create({ data: { ...body, userId: user.id, date: new Date(body.date) } });
  return NextResponse.json({ data: created });
}
