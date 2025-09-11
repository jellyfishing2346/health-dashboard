
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function midday(): Date { const iso = new Date().toISOString().split('T')[0]; return new Date(iso + 'T12:00:00.000Z'); }

async function main() { const existing = await prisma.user.count(); if (existing > 0 && !process.env.RESET) { console.log('Seed skipped (data already present). Set RESET=1 to force.'); return; } if (process.env.RESET) { console.log('RESET=1 provided: clearing existing data...'); await prisma.goal.deleteMany(); await prisma.physicalEntry.deleteMany(); await prisma.mentalEntry.deleteMany(); await prisma.profile.deleteMany(); await prisma.user.deleteMany(); }

const user = await prisma.user.create({ data: { id: 'seed-user-1', name: 'Seed User', email: 'seed.user@example.com', image: null, profile: { create: { id: 'seed-profile-1', age: 35, gender: 'other', height: 170, weight: 70 } }, physicalEntries: { create: [{ id: 'phys-1', date: midday(), heartRate: 64, bloodPressureSystolic: 118, bloodPressureDiastolic: 76, steps: 8000, sleepHours: 7.2, exerciseMinutes: 30, notes: 'Seed physical entry' }] }, mentalEntries: { create: [{ id: 'ment-1', date: midday(), mood: 7, stressLevel: 3, meditationMinutes: 10, notes: 'Feeling good after a walk.' }] }, goals: { create: [{ id: 'goal-1', title: '10k steps', description: 'Daily step target', category: 'activity', targetValue: 10000, currentValue: 8000, unit: 'steps', targetDate: midday() }] } }, include: { physicalEntries: true, mentalEntries: true, goals: true, profile: true } });

console.log('Seeded user:', user.id); }

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });