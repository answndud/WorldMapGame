'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: 'q1',
    question: '선호하는 여행 스타일은?',
    options: [
      { value: '액티브', label: '🏃 액티브하게 돌아다니기' },
      { value: '여유', label: '☕ 여유롭게 즐기기' },
      { value: '모험', label: '🧗 모험적인 활동' },
      { value: '휴식', label: '🏖️ 편안한 휴식' },
    ]
  },
  {
    id: 'q2',
    question: '선호하는 기후는?',
    options: [
      { value: '열대', label: '🌴 더운 열대 기후' },
      { value: '온대', label: '🌸 온화한 날씨' },
      { value: '한랭', label: '❄️ 시원한 기후' },
      { value: '사계절', label: '🍂 사계절이 뚜렷한 곳' },
    ]
  },
  {
    id: 'q3',
    question: '여행 예산은?',
    options: [
      { value: '저예산', label: '💰 가성비 중시' },
      { value: '중간', label: '💳 적당한 수준' },
      { value: '고예산', label: '💎 럭셔리한 여행' },
      { value: '무관', label: '🎯 예산 무관' },
    ]
  },
  {
    id: 'q4',
    question: '선호하는 활동은?',
    options: [
      { value: '관광', label: '📸 관광지 탐방' },
      { value: '자연', label: '🏔️ 자연 체험' },
      { value: '문화', label: '🎭 문화/예술 체험' },
      { value: '쇼핑', label: '🛍️ 쇼핑' },
    ]
  },
  {
    id: 'q5',
    question: '음식 취향은?',
    options: [
      { value: '모험적', label: '🍜 색다른 음식 도전' },
      { value: '익숙한', label: '🍔 익숙한 맛 선호' },
      { value: '고급', label: '🍽️ 파인다이닝' },
      { value: '길거리', label: '🌮 길거리 음식' },
    ]
  },
  {
    id: 'q6',
    question: '언어 능력은?',
    options: [
      { value: '영어가능', label: '🗣️ 영어 소통 가능' },
      { value: '제한적', label: '📱 번역앱 의존' },
      { value: '다국어', label: '🌍 여러 언어 가능' },
      { value: '무관', label: '🎭 언어 무관' },
    ]
  },
  {
    id: 'q7',
    question: '관심있는 문화는?',
    options: [
      { value: '역사', label: '🏛️ 역사/유적지' },
      { value: '현대', label: '🏙️ 현대적인 도시' },
      { value: '전통', label: '🎎 전통 문화' },
      { value: '다양성', label: '🌈 문화 다양성' },
    ]
  },
  {
    id: 'q8',
    question: '인구밀도 선호는?',
    options: [
      { value: '대도시', label: '🏢 번화한 대도시' },
      { value: '중소도시', label: '🏘️ 적당한 도시' },
      { value: '전원', label: '🌾 한적한 시골' },
      { value: '무관', label: '🎯 상관없음' },
    ]
  },
];

interface RecommendationResult {
  top3: Array<{
    country: string;
    countryKo: string;
    reason: string;
    score: number;
  }>;
  summary: string;
  usedAI: boolean;
}

export default function AIRecommendPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion?.id];

  function handleAnswer(value: string) {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  }

  function handleNext() {
    if (isLastQuestion) {
      submitAnswers();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function submitAnswers() {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setResult(data);
      
      if (!data.usedAI) {
        toast.info('AI API가 설정되지 않아 기본 추천을 제공합니다.');
      }
    } catch (error) {
      toast.error('추천 생성 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center bg-slate-800/50 border-slate-700">
          <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">AI가 분석 중입니다...</h2>
          <p className="text-slate-300">당신에게 맞는 여행지를 찾고 있습니다</p>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              AI 추천 결과
            </h1>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* 요약 */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <h2 className="text-xl font-bold text-white mb-3">당신을 위한 추천</h2>
              <p className="text-slate-300">{result.summary}</p>
              {!result.usedAI && (
                <p className="text-sm text-amber-400 mt-2">
                  ⚠️ AI API 미설정 - 기본 추천이 제공되었습니다
                </p>
              )}
            </Card>

            {/* Top 3 국가 */}
            <div className="space-y-6 mb-8">
              {result.top3.map((rec, index) => (
                <Card key={index} className="p-6 bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {rec.countryKo}
                        <span className="text-slate-400 text-lg ml-2">({rec.country})</span>
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-amber-400 font-semibold">적합도: {rec.score}점</span>
                      </div>
                      <p className="text-slate-300">{rec.reason}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                className="flex-1 py-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                다시 추천받기
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1 py-6 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                홈으로
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            AI 국가 추천
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 진행 표시 */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>질문 {currentStep + 1} / {questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 질문 카드 */}
          <Card className="p-8 bg-slate-800/50 border-slate-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {currentQuestion.question}
            </h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-2 border-amber-500'
                      : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600 hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-lg">{option.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* 네비게이션 버튼 */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 py-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? '결과 보기' : '다음'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
