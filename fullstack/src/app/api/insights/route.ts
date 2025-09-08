import OpenAI from 'openai';

export const runtime = 'nodejs';

function summarizeNumbers(arr: number[]) {
  if (!arr.length) return { avg: 0, min: 0, max: 0 };
  const sum = arr.reduce((a, b) => a + b, 0);
  return { avg: +(sum / arr.length).toFixed(2), min: Math.min(...arr), max: Math.max(...arr) };
}

function generateFallback(data: {
  profile?: any;
  phys: { heartRate: any; sleepHours: any; exerciseMinutes: any; weight: any };
  ment: { mood: any; stressLevel: any; energyLevel: any; meditationMinutes: any };
}) {
  const { profile, phys, ment } = data;
  const insights: string[] = [];
  const suggestions: string[] = [];

  if (phys.sleepHours.avg && phys.sleepHours.avg < 7) {
    insights.push(`Average sleep is ${phys.sleepHours.avg} h (below 7 h).`);
    suggestions.push('Aim for a consistent bedtime and wind-down routine.');
  }
  if (ment.stressLevel.avg && ment.stressLevel.avg >= 3) {
    insights.push(`Stress level averages ${ment.stressLevel.avg}/5.`);
    suggestions.push('Try a 5-minute breathing exercise today.');
  }
  if (phys.exerciseMinutes.avg && phys.exerciseMinutes.avg < 20) {
    insights.push(`Exercise averages ${phys.exerciseMinutes.avg} min/day.`);
    suggestions.push('Take a 10–15 minute walk to get moving.');
  }
  if (ment.mood.avg && ment.mood.avg < 3) {
    insights.push(`Mood averages ${ment.mood.avg}/5.`);
    suggestions.push('Do one enjoyable, low-effort activity you like.');
  }
  if (insights.length === 0) {
    insights.push('Your recent data looks steady.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Drink water regularly and take stretch breaks.');
  }
  return { insights, suggestions, goals: [] as string[] };
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
    }

    const body = await req.json();
    const { profile, physical = [], mental = [], goals = [] } = body ?? {};

    const phys = {
      heartRate: summarizeNumbers(physical.map((p: any) => p.heartRate).filter((n: any) => typeof n === 'number')),
      sleepHours: summarizeNumbers(physical.map((p: any) => p.sleepHours).filter((n: any) => typeof n === 'number')),
      exerciseMinutes: summarizeNumbers(physical.map((p: any) => p.exerciseMinutes).filter((n: any) => typeof n === 'number')),
      weight: summarizeNumbers(physical.map((p: any) => p.weight).filter((n: any) => typeof n === 'number')),
    };

    const ment = {
      mood: summarizeNumbers(mental.map((m: any) => m.mood).filter((n: any) => typeof n === 'number')),
      stressLevel: summarizeNumbers(mental.map((m: any) => m.stressLevel).filter((n: any) => typeof n === 'number')),
      energyLevel: summarizeNumbers(mental.map((m: any) => m.energyLevel).filter((n: any) => typeof n === 'number')),
      meditationMinutes: summarizeNumbers(mental.map((m: any) => m.meditationMinutes).filter((n: any) => typeof n === 'number')),
    };

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
      project: process.env.OPENAI_PROJECT,
    } as any);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const maxTokens = Math.max(1, parseInt(process.env.OPENAI_MAX_TOKENS || '300', 10) || 300);

    const prompt = {
      role: 'user' as const,
      content: JSON.stringify({
        profile: { age: profile?.age, gender: profile?.gender, height: profile?.height, weight: profile?.weight },
        physicalSummary: phys,
        mentalSummary: ment,
        goals: goals?.map((g: any) => ({ title: g.title, completed: !!g.completed, targetValue: g.targetValue, currentValue: g.currentValue, unit: g.unit })) ?? [],
      }),
    };

    let completion;
    try {
      completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a supportive wellness coach. Provide inclusive, age and gender neutral guidance. Output strict JSON with keys insights (array of strings), suggestions (array of strings), and goals (array of strings). Keep items short and actionable. Avoid medical diagnosis.',
          },
          prompt,
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: maxTokens,
      });
    } catch (apiErr: any) {
      const status = apiErr?.status || apiErr?.response?.status || 500;
      const detail = apiErr?.error?.message || apiErr?.response?.data?.error?.message || apiErr?.message || 'OpenAI request failed';
      const quotaLike = status === 429 || /quota|insufficient_quota/i.test(String(detail));
      if (process.env.NODE_ENV !== 'production') {
        console.error('Insights OpenAI error:', { status, detail });
      }
      if (quotaLike) {
        const fallback = generateFallback({ profile, phys, ment });
        return Response.json({ error: 'quota_exceeded', fallback }, { status: 429 });
      }
      return Response.json({ error: detail || 'Failed to generate insights' }, { status: status === 200 ? 500 : status });
    }

    const raw = completion.choices[0]?.message?.content || '{}';
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { insights: [], suggestions: [], goals: [] };
    }

    return Response.json(data);
  } catch (err: any) {
    console.error('Insights error', err);
    return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
