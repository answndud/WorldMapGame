import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCapitalClick } from '@/lib/game/validators';
import { generateQuestion } from '@/lib/game/generators';

const clickAnswerSchema = z.object({
  runId: z.string(),
  iso3: z.string(),
  clickLat: z.number(),
  clickLng: z.number()
});

// 메모리 저장소
const runs = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, iso3, clickLat, clickLng } = clickAnswerSchema.parse(body);

    const run = runs.get(runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    if (run.status === 'ended') {
      return NextResponse.json({ error: 'Run has ended' }, { status: 400 });
    }

    if (run.question.step !== 'clickCapital') {
      return NextResponse.json(
        { error: 'Must complete country selection first' },
        { status: 400 }
      );
    }

    // 수도 클릭 검증
    const { capitalLat, capitalLng } = run.question;
    const validation = validateCapitalClick(clickLat, clickLng, capitalLat, capitalLng);

    if (validation.correct) {
      // Step 2 정답: +10점, 다음 질문
      run.score += 10;
      
      const newUsed = [...run.usedIso3, run.question.iso3];
      run.usedIso3 = newUsed;

      const nextQuestion = generateQuestion('A2', newUsed);
      run.question = nextQuestion;

      runs.set(runId, run);

      return NextResponse.json({
        correct: true,
        score: run.score,
        attemptsLeft: run.attemptsLeft,
        question: nextQuestion,
        status: run.status,
        distance: validation.distance
      });
    } else {
      // Step 2 오답
      run.attemptsLeft -= 1;

      if (run.attemptsLeft <= 0) {
        run.status = 'ended';
        runs.set(runId, run);

        return NextResponse.json({
          correct: false,
          score: run.score,
          attemptsLeft: 0,
          status: 'ended',
          distance: validation.distance,
          message: '게임이 종료되었습니다.'
        });
      }

      // 같은 질문으로 다시 시도 (Step 1부터)
      run.question.step = 'pickCountry';
      runs.set(runId, run);

      return NextResponse.json({
        correct: false,
        score: run.score,
        attemptsLeft: run.attemptsLeft,
        question: run.question,
        status: run.status,
        distance: validation.distance
      });
    }
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
