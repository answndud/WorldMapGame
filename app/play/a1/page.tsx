'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ScoreHeader from '@/components/ScoreHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { XCircle, Globe as GlobeIcon } from 'lucide-react';

// ISO3 코드를 국기 이모지로 변환
function getFlagEmoji(iso3: string): string {
  const iso2Map: { [key: string]: string } = {
    'USA': 'US', 'CHN': 'CN', 'IND': 'IN', 'IDN': 'ID', 'PAK': 'PK',
    'BRA': 'BR', 'NGA': 'NG', 'BGD': 'BD', 'RUS': 'RU', 'MEX': 'MX',
    'JPN': 'JP', 'ETH': 'ET', 'PHL': 'PH', 'EGY': 'EG', 'VNM': 'VN',
    'COD': 'CD', 'TUR': 'TR', 'IRN': 'IR', 'DEU': 'DE', 'THA': 'TH',
    'GBR': 'GB', 'FRA': 'FR', 'ITA': 'IT', 'ZAF': 'ZA', 'TZA': 'TZ',
    'MMR': 'MM', 'KOR': 'KR', 'COL': 'CO', 'ESP': 'ES', 'KEN': 'KE',
    'ARG': 'AR', 'DZA': 'DZ', 'SDN': 'SD', 'UGA': 'UG', 'CAN': 'CA',
    'POL': 'PL', 'IRQ': 'IQ', 'MAR': 'MA', 'SAU': 'SA', 'AUS': 'AU',
    'PER': 'PE', 'MYS': 'MY', 'VEN': 'VE', 'NPL': 'NP', 'GHA': 'GH',
    'YEM': 'YE', 'MOZ': 'MZ', 'CHL': 'CL', 'NLD': 'NL', 'GRC': 'GR',
    'PRT': 'PT', 'SWE': 'SE', 'CHE': 'CH', 'SGP': 'SG'
  };
  
  const iso2 = iso2Map[iso3] || iso3.slice(0, 2);
  return String.fromCodePoint(
    ...[...iso2].map(c => 127397 + c.charCodeAt(0))
  );
}

const GlobeCanvas = dynamic(() => import('@/components/GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-black rounded-lg flex items-center justify-center">
      <p className="text-slate-400">3D 지구본을 로딩하는 중...</p>
    </div>
  )
});

interface GameState {
  runId: string;
  score: number;
  attemptsLeft: number;
  question: {
    type: 'A1';
    targetIso3: string;
    targetName: string;
    targetNameKo: string;
  };
  status: 'active' | 'ended';
}

export default function ModeA1Page() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  async function startGame() {
    setLoading(true);
    try {
      const response = await fetch('/api/run/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'A1' })
      });

      if (!response.ok) throw new Error('Failed to start game');

      const data = await response.json();
      setGameState({
        runId: data.runId,
        score: data.score,
        attemptsLeft: data.attemptsLeft,
        question: data.question,
        status: 'active'
      });
    } catch (error) {
      toast.error('게임을 시작할 수 없습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCountryClick(clickedIso3: string) {
    if (!gameState || isSubmitting || gameState.status === 'ended') return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/run/a1/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          targetIso3: gameState.question.targetIso3,
          clickedIso3
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const data = await response.json();

      if (data.correct) {
        toast.success('정답입니다! 🎉', {
          description: '+10점'
        });
        
        setGameState({
          ...gameState,
          score: data.score,
          question: data.question
        });
      } else {
        toast.error('틀렸습니다 ❌', {
          description: `남은 기회: ${data.attemptsLeft}`
        });
        
        setGameState({
          ...gameState,
          attemptsLeft: data.attemptsLeft,
          status: data.status
        });

        if (data.status === 'ended') {
          setTimeout(() => {
            toast.error('게임 종료', {
              description: `최종 점수: ${gameState?.score}점`
            });
          }, 1500);
        }
      }
    } catch (error) {
      toast.error('답안 제출 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEndRun() {
    if (confirm('게임을 종료하시겠습니까?')) {
      router.push('/');
    }
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-900 dark:text-white text-xl">게임을 준비하는 중...</div>
      </div>
    );
  }

  if (gameState.status === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <ScoreHeader score={gameState.score} attemptsLeft={gameState.attemptsLeft} />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto p-8 text-center bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">게임 종료</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-2">최종 점수</p>
            <p className="text-5xl font-bold text-yellow-400 mb-6">{gameState.score}점</p>
            <div className="flex gap-3">
              <Button onClick={() => startGame()} className="flex-1 bg-blue-600 hover:bg-blue-700">
                다시 하기
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                홈으로
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ScoreHeader
        score={gameState.score}
        attemptsLeft={gameState.attemptsLeft}
        onEndRun={handleEndRun}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* 게임 설명 */}
          <Card className="p-6 mb-6 bg-blue-500/10 border-blue-500/30">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              3D 지구본 국가 찾기 - Level 1
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <GlobeIcon className="w-6 h-6 text-blue-400" />
              <div className="flex items-center gap-3">
                <span className="text-slate-700 dark:text-slate-300">찾아야 할 국가:</span>
                <div className="flex items-center gap-3 bg-blue-500/20 px-4 py-2 rounded-lg">
                  <span className="text-4xl">{getFlagEmoji(gameState.question.targetIso3)}</span>
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-2xl">
                      {gameState.question.targetNameKo}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-lg ml-2">
                      ({gameState.question.targetName})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • 지구본을 드래그하여 회전시키고, 흰색 점을 클릭하세요
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • 정답: +10점 | 3번 틀리면 게임 종료
            </p>
          </Card>

          {/* 3D 지구본 */}
          <GlobeCanvas
            targetIso3={gameState.question.targetIso3}
            onCountryClick={handleCountryClick}
          />
        </div>
      </div>
    </div>
  );
}
