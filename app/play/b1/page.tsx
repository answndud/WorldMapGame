'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScoreHeader from '@/components/ScoreHeader';
import PopulationOrderBoard from '@/components/PopulationOrderBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface GameState {
  runId: string;
  score: number;
  attemptsLeft: number;
  question: {
    type: 'B';
    mode: 'B1';
    items: Array<{
      iso3: string;
      name: string;
      nameKo: string;
    }>;
  };
  status: 'active' | 'ended';
}

export default function ModeB1Page() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 게임 시작
  useEffect(() => {
    startGame();
  }, []);

  async function startGame() {
    setLoading(true);
    try {
      const response = await fetch('/api/run/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'B1' })
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      const data = await response.json();
      setGameState({
        runId: data.runId,
        score: data.score,
        attemptsLeft: data.attemptsLeft,
        question: data.question,
        status: 'active'
      });
      setCurrentOrder(data.question.items.map((item: any) => item.iso3));
    } catch (error) {
      toast.error('게임을 시작할 수 없습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!gameState || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/run/b/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          mode: 'B1',
          orderedIso3: currentOrder
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();

      if (data.correct) {
        toast.success('정답입니다! 🎉', {
          description: `+10점`
        });
        
        // 다음 질문으로 업데이트
        const newQuestion = data.question;
        setGameState({
          ...gameState,
          score: data.score,
          question: newQuestion
        });
        
        // 새로운 질문의 국가 순서로 currentOrder 업데이트
        const newOrder = newQuestion.items.map((item: any) => item.iso3);
        setCurrentOrder(newOrder);
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
            showGameOverModal();
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

  function showGameOverModal() {
    toast.error('게임 종료', {
      description: `최종 점수: ${gameState?.score}점`,
      duration: 5000
    });
  }

  function handleEndRun() {
    if (confirm('게임을 종료하시겠습니까?')) {
      router.push('/');
    }
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">게임을 준비하는 중...</div>
      </div>
    );
  }

  if (gameState.status === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ScoreHeader
          score={gameState.score}
          attemptsLeft={gameState.attemptsLeft}
        />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto p-8 text-center bg-slate-800/50 border-slate-700">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">게임 종료</h2>
            <p className="text-slate-300 mb-2">최종 점수</p>
            <p className="text-5xl font-bold text-yellow-400 mb-6">
              {gameState.score}점
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => startGame()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ScoreHeader
        score={gameState.score}
        attemptsLeft={gameState.attemptsLeft}
        onEndRun={handleEndRun}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 게임 설명 */}
          <Card className="p-6 mb-6 bg-purple-500/10 border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-2">
              인구수 정렬 게임 - Level 1
            </h2>
            <p className="text-slate-300">
              아래 3개 국가를 <span className="font-bold text-purple-400">인구가 많은 순서대로</span> 드래그하여 정렬하세요.
            </p>
          </Card>

          {/* 정렬 보드 */}
          <div className="mb-6">
            <PopulationOrderBoard
              countries={gameState.question.items}
              onOrderChange={setCurrentOrder}
            />
          </div>

          {/* 제출 버튼 */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? '제출 중...' : '정답 제출'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
