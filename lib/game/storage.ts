// 메모리 기반 게임 세션 저장소
// 실제 운영시엔 Supabase 또는 Redis 사용

export interface GameRun {
  runId: string;
  mode: 'A1' | 'A2' | 'B1' | 'B2' | 'C';
  score: number;
  attemptsLeft: number;
  question: any;
  usedIso3: string[];
  status: 'active' | 'ended';
}

// 전역 공유 저장소
const runs = new Map<string, GameRun>();

export function createRun(run: GameRun): void {
  runs.set(run.runId, run);
}

export function getRun(runId: string): GameRun | undefined {
  return runs.get(runId);
}

export function updateRun(runId: string, run: GameRun): void {
  runs.set(runId, run);
}

export function deleteRun(runId: string): void {
  runs.delete(runId);
}

export function getAllRuns(): Map<string, GameRun> {
  return runs;
}
