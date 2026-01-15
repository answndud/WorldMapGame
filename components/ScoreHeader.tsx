'use client';

import { Trophy, Heart, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

interface ScoreHeaderProps {
  score: number;
  attemptsLeft: number;
  onEndRun?: () => void;
}

export default function ScoreHeader({ score, attemptsLeft, onEndRun }: ScoreHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">점수: {score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-white font-semibold">
              남은 기회: {attemptsLeft}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          {onEndRun && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEndRun}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              게임 종료
            </Button>
          )}
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              홈으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
