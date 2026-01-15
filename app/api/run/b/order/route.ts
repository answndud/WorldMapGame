import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validatePopulationOrder } from '@/lib/game/validators';
import { generateQuestion } from '@/lib/game/generators';

const orderSchema = z.object({
  runId: z.string(),
  mode: z.enum(['B1', 'B2']),
  orderedIso3: z.array(z.string())
});

// 메모리 저장소 (실제론 Supabase에서 가져옴)
const runs = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, mode, orderedIso3 } = orderSchema.parse(body);

    // Run 조회 (실제론 Supabase에서)
    const run = runs.get(runId) || {
      runId,
      mode,
      score: 0,
      attemptsLeft: 3,
      usedIso3: [],
      status: 'active'
    };

    if (run.status === 'ended') {
      return NextResponse.json(
        { error: 'Run has ended' },
        { status: 400 }
      );
    }

    // 정렬 검증
    const correct = validatePopulationOrder(orderedIso3);

    if (correct) {
      // 정답: 점수 추가
      const pointsPerLevel = mode === 'B1' ? 10 : 20;
      run.score += pointsPerLevel;
      
      // 사용한 ISO3 추가
      const newUsed = [...run.usedIso3, ...orderedIso3];
      run.usedIso3 = newUsed;

      // 다음 질문 생성
      const nextQuestion = generateQuestion(mode, newUsed);
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
