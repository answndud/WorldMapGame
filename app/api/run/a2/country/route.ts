import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCountryByCapital } from '@/lib/datasets/countries';

const countryAnswerSchema = z.object({
  runId: z.string(),
  capitalName: z.string(),
  pickedIso3: z.string()
});

// 메모리 저장소
const runs = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, capitalName, pickedIso3 } = countryAnswerSchema.parse(body);

    const run = runs.get(runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    if (run.status === 'ended') {
      return NextResponse.json({ error: 'Run has ended' }, { status: 400 });
    }

    // 정답 확인
    const correctCountry = getCountryByCapital(capitalName);
    const correct = correctCountry?.iso3 === pickedIso3;

    if (correct) {
      // Step 1 정답: +5점, Step 2로 진행
      run.score += 5;
      run.question.step = 'clickCapital';
      runs.set(runId, run);

      return NextResponse.json({
        correct: true,
        score: run.score,
        attemptsLeft: run.attemptsLeft,
        question: run.question,
        status: run.status,
        message: '국가 선택 정답! 이제 수도 위치를 클릭하세요.'
      });
    } else {
      // Step 1 오답
      run.attemptsLeft -= 1;

      if (run.attemptsLeft <= 0) {
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

      runs.set(runId, run);

      return NextResponse.json({
        correct: false,
        score: run.score,
        attemptsLeft: run.attemptsLeft,
        question: run.question,
        status: run.status,
        message: '틀렸습니다. 다시 시도하세요.'
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
