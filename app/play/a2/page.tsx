'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ScoreHeader from '@/components/ScoreHeader';
import CountrySelect from '@/components/CountrySelect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { XCircle, ArrowRight, MapPin } from 'lucide-react';

// Leaflet은 클라이언트 사이드에서만 로드
const CountryMap2D = dynamic(() => import('@/components/CountryMap2D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-800 rounded-lg flex items-center justify-center">
      <p className="text-slate-400">지도를 로딩하는 중...</p>
    </div>
  )
});

interface GameState {
  runId: string;
  score: number;
  attemptsLeft: number;
  question: {
    type: 'A2';
    iso3: string;
    capitalName: string;
    capitalLat: number;
    capitalLng: number;
    step: 'pickCountry' | 'clickCapital';
  };
  status: 'active' | 'ended';
}

export default function ModeA2Page() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [clickPosition, setClickPosition] = useState<[number, number] | undefined>();
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
        body: JSON.stringify({ mode: 'A2' })
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
      setSelectedCountry('');
      setClickPosition(undefined);
    } catch (error) {
      toast.error('게임을 시작할 수 없습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCountrySubmit() {
    if (!gameState || !selectedCountry || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/run/a2/country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          capitalName: gameState.question.capitalName,
          pickedIso3: selectedCountry
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const data = await response.json();

      if (data.correct) {
        toast.success('정답입니다! 🎉', {
          description: '+5점. 이제 수도 위치를 클릭하세요.'
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

  async function handleMapClick(lat: number, lng: number) {
    if (!gameState || gameState.question.step !== 'clickCapital' || isSubmitting) return;

    setClickPosition([lat, lng]);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/run/a2/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          iso3: gameState.question.iso3,
          clickLat: lat,
          clickLng: lng
        })
      });

      if (!response.ok) throw new Error('Failed to submit click');

      const data = await response.json();

      if (data.correct) {
        toast.success('정답입니다! 🎉', {
          description: `+10점 (거리: ${data.distance?.toFixed(1)}km)`
        });
        
        setGameState({
          ...gameState,
          score: data.score,
          question: data.question
        });
        setSelectedCountry('');
        setClickPosition(undefined);
      } else {
        toast.error('틀렸습니다 ❌', {
          description: `거리: ${data.distance?.toFixed(1)}km, 남은 기회: ${data.attemptsLeft}`
        });
        
        setGameState({
          ...gameState,
          attemptsLeft: data.attemptsLeft,
          question: data.question,
          status: data.status
        });
        setSelectedCountry('');
        setClickPosition(undefined);

        if (data.status === 'ended') {
          setTimeout(() => {
            toast.error('게임 종료', {
              description: `최종 점수: ${gameState?.score}점`
            });
          }, 1500);
        }
      }
    } catch (error) {
      toast.error('클릭 처리 중 오류가 발생했습니다.');
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

  const isStep1 = gameState.question.step === 'pickCountry';
  const isStep2 = gameState.question.step === 'clickCapital';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ScoreHeader
        score={gameState.score}
        attemptsLeft={gameState.attemptsLeft}
        onEndRun={handleEndRun}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 게임 설명 */}
          <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-300 dark:border-blue-500/30">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              수도 맞추기 게임 - Level 2
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-2">
              <MapPin className="inline w-5 h-5 mr-1 text-blue-600 dark:text-blue-400" />
              수도: <span className="font-bold text-blue-700 dark:text-blue-400 text-xl">{gameState.question.capitalName}</span>
            </p>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p>• Step 1: 이 수도가 속한 국가를 선택하세요 (+5점)</p>
              <p>• Step 2: 2D 지도에서 수도의 정확한 위치를 클릭하세요 (+10점)</p>
            </div>
          </Card>

          {/* Step 1: 국가 선택 */}
          {isStep1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Step 1: 국가 선택
              </h3>
              <CountrySelect
                value={selectedCountry}
                onChange={setSelectedCountry}
                placeholder="국가를 선택하세요"
              />
              <Button
                onClick={handleCountrySubmit}
                disabled={!selectedCountry || isSubmitting}
                className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? '제출 중...' : '국가 제출'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: 수도 위치 클릭 */}
          {isStep2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Step 2: 수도 위치 클릭
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                지도를 클릭하여 <span className="font-bold text-blue-400">{gameState.question.capitalName}</span>의 위치를 표시하세요.
              </p>
              <CountryMap2D
                iso3={gameState.question.iso3}
                onMapClick={handleMapClick}
                markerPosition={clickPosition}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
