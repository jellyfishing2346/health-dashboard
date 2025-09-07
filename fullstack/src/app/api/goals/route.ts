import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/config';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ data: [] });
  const data = await db.goal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const created = await db.goal.create({ data: { ...body, userId: user.id } });
  return NextResponse.json({ data: created });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const updated = await db.goal.update({ where: { id: body.id, }, data: body });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await db.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
