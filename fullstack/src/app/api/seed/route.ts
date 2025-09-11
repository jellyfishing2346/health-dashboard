import { NextResponse } from 'next/server'; import { db } from '@/lib/db';

export async function GET() { const existing = await db.user.count(); if (existing > 0) { return NextResponse.json({ status: 'skipped', reason: 'data already present' }); }

const user = await db.user.create({
  data: {
	id: 'seed-user-1',
	name: 'Seed User',
	email: 'seed.user@example.com',
	image: null,
	profile: {
	  create: {
		id: 'seed-profile-1',
		age: 35,
		gender: 'other',
		height: 170,
		weightKg: 70
	  }
	},
	physicalEntries: {
	  create: [
		{
		  id: 'phys-1',
		  date: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z',
		  steps: 8000,
		  caloriesBurned: 2100,
		  sleepHours: 7.2,
		  systolic: 118,
		  diastolic: 76,
		  heartRate: 64
		}
	  ]
	},
	mentalEntries: {
	  create: [
		{
		  id: 'ment-1',
		  date: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z',
		  mood: 7,
		  stressLevel: 3,
		  notes: 'Feeling good after a walk.'
		}
	  ]
	},
	goals: {
	  create: [
		{
		  id: 'goal-1',
		  goalType: 'steps',
		  target: 10000,
		  current: 8000
		}
	  ]
	}
  },
  include: {
	physicalEntries: true,
	mentalEntries: true,
	goals: true,
	profile: true
  }
});

return NextResponse.json({ status: 'seeded', user }); }

