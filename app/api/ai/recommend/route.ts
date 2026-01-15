import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLlmProvider, type QuizAnswer } from '@/lib/ai/provider';

const recommendSchema = z.object({
  answers: z.object({
    q1: z.string(),
    q2: z.string(),
    q3: z.string(),
    q4: z.string(),
    q5: z.string(),
    q6: z.string(),
    q7: z.string(),
    q8: z.string(),
  })
});

// 간단한 캐시 (실제론 Redis 사용)
const cache = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = recommendSchema.parse(body);

    // 캐시 키 생성
    const cacheKey = JSON.stringify(answers);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return NextResponse.json(cached.result);
    }

    // LLM 제공자 가져오기
    const provider = getLlmProvider();
    
    if (!provider) {
      // LLM이 설정되지 않은 경우 기본 추천
      return NextResponse.json({
        top3: [
          {
            country: 'Japan',
            countryKo: '일본',
            reason: '다양한 문화 체험과 맛있는 음식, 편리한 대중교통으로 여행하기 좋은 나라입니다.',
            score: 90
          },
          {
            country: 'Italy',
            countryKo: '이탈리아',
            reason: '풍부한 역사와 예술, 세계적인 음식 문화를 경험할 수 있습니다.',
            score: 85
          },
          {
            country: 'Thailand',
            countryKo: '태국',
            reason: '저렴한 물가와 아름다운 자연, 친절한 사람들로 유명합니다.',
            score: 80
          }
        ],
        summary: '당신의 선호도를 바탕으로 문화, 음식, 자연이 조화로운 국가들을 추천드립니다.',
        usedAI: false
      });
    }

    // AI 추천 실행
    const result = await provider.recommendCountry(answers as QuizAnswer);
    
    // 캐시 저장
    cache.set(cacheKey, {
      result: { ...result, usedAI: true },
      timestamp: Date.now()
    });

    return NextResponse.json({ ...result, usedAI: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
