import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateQuestion } from '@/lib/game/generators';
import { createRun, getRun, type GameRun } from '@/lib/game/storage';

const startRunSchema = z.object({
  mode: z.enum(['A1', 'A2', 'B1', 'B2', 'C'])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = startRunSchema.parse(body);

    const runId = crypto.randomUUID();
    const question = generateQuestion(mode, []);

    const run: GameRun = {
      runId,
      mode,
      score: 0,
      attemptsLeft: 3,
      question,
      usedIso3: [],
      status: 'active'
    };

    createRun(run);

    return NextResponse.json({
      runId,
      score: run.score,
      attemptsLeft: run.attemptsLeft,
      question: run.question
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get('runId');
  
  if (!runId) {
    return NextResponse.json({ error: 'runId required' }, { status: 400 });
  }

  const run = getRun(runId);
  
  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  return NextResponse.json({
    runId: run.runId,
    mode: run.mode,
    score: run.score,
    attemptsLeft: run.attemptsLeft,
    question: run.question,
    status: run.status
  });
}
