import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCountryClick } from '@/lib/game/validators';
import { generateQuestion } from '@/lib/game/generators';

const answerSchema = z.object({
  runId: z.string(),
  targetIso3: z.string(),
  clickedIso3: z.string()
});

// 메모리 저장소
const runs = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, targetIso3, clickedIso3 } = answerSchema.parse(body);

    const run = runs.get(runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    if (run.status === 'ended') {
      return NextResponse.json({ error: 'Run has ended' }, { status: 400 });
    }

    // 정답 확인
    const correct = validateCountryClick(targetIso3, clickedIso3);

    if (correct) {
      // 정답: +10점, 다음 질문
      run.score += 10;
      
      const newUsed = [...run.usedIso3, targetIso3];
      run.usedIso3 = newUsed;

      const nextQuestion = generateQuestion('A1', newUsed);
      run.question = nextQuestion;

      runs.set(runId, run);

      return NextResponse.json({
        correct: true,
        score: run.score,
        attemptsLeft: run.attemptsLeft,
        question: nextQuestion,
        status: run.status
      });
    } else {
      // 오답: 시도 횟수 감소
      run.attemptsLeft -= 1;

      if (run.attemptsLeft <= 0) {
        // 게임 종료
        run.status = 'ended';
        runs.set(runId, run);

        return NextResponse.json({
          correct: false,
          score: run.score,
          attemptsLeft: 0,
          status: 'ended',
          question: run.question,
          message: '게임이 종료되었습니다.'
        });
      }

      // 같은 질문 유지
      runs.set(runId, run);

      return NextResponse.json({
        correct: false,
        score: run.score,
        attemptsLeft: run.attemptsLeft,
        question: run.question,
        status: run.status
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
