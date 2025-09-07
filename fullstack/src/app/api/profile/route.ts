import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/config';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ data: profile });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const data = {
    age: Number(body.age) || 0,
    gender: String(body.gender || ''),
    height: Number(body.height) || 0,
    weight: Number(body.weight) || 0,
  };

  const existing = await db.profile.findUnique({ where: { userId: user.id } });
  const profile = existing
    ? await db.profile.update({ where: { userId: user.id }, data })
    : await db.profile.create({ data: { ...data, userId: user.id } });

  return NextResponse.json({ data: profile });
}
