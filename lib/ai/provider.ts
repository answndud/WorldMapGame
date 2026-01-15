export interface QuizAnswer {
  q1: string; // 여행 스타일
  q2: string; // 선호 기후
  q3: string; // 예산
  q4: string; // 활동
  q5: string; // 음식
  q6: string; // 언어
  q7: string; // 문화
  q8: string; // 인구밀도
}

export interface CountryRecommendation {
  country: string;
  countryKo: string;
  reason: string;
  score: number;
}

export interface RecommendationResult {
  top3: CountryRecommendation[];
  summary: string;
}

export interface LlmProvider {
  name: string;
  recommendCountry(answers: QuizAnswer): Promise<RecommendationResult>;
}

class OpenAIProvider implements LlmProvider {
  name = 'OpenAI';
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async recommendCountry(answers: QuizAnswer): Promise<RecommendationResult> {
    const prompt = this.buildPrompt(answers);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 가장 저렴한 모델
        messages: [
          {
            role: 'system',
            content: '당신은 여행 전문가입니다. 사용자의 선호도를 바탕으로 최적의 여행지를 추천합니다. 응답은 반드시 JSON 형식으로만 제공하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      top3: result.recommendations,
      summary: result.summary
    };
  }

  private buildPrompt(answers: QuizAnswer): string {
    return `
사용자의 여행 선호도:
- 여행 스타일: ${answers.q1}
- 선호 기후: ${answers.q2}
- 예산: ${answers.q3}
- 선호 활동: ${answers.q4}
- 음식 취향: ${answers.q5}
- 언어 능력: ${answers.q6}
- 문화 관심사: ${answers.q7}
- 인구밀도 선호: ${answers.q8}

위 정보를 바탕으로 가장 적합한 여행 국가 3곳을 추천해주세요.

응답 형식 (JSON):
{
  "recommendations": [
    {
      "country": "영어 국가명",
      "countryKo": "한국어 국가명",
      "reason": "추천 이유 (2-3문장)",
      "score": 95
    }
  ],
  "summary": "전체 추천 요약 (2-3문장)"
}
`;
  }
}

export function getLlmProvider(): LlmProvider | null {
  const provider = process.env.LLM_PROVIDER || 'openai';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('No LLM API key configured');
    return null;
  }

  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    default:
      console.warn(`Unknown LLM provider: ${provider}`);
      return null;
  }
}
