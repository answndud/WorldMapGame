-- 게임 실행 기록 테이블
CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('A1', 'A2', 'B1', 'B2', 'C')),
  status TEXT NOT NULL CHECK (status IN ('active', 'ended')) DEFAULT 'active',
  score INTEGER NOT NULL DEFAULT 0,
  attempts_left INTEGER NOT NULL DEFAULT 3,
  current_question JSONB,
  used_iso3 TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_score CHECK (score >= 0),
  CONSTRAINT valid_attempts CHECK (attempts_left >= 0 AND attempts_left <= 3)
);

-- 게임 이벤트 로그 (선택적, 디버깅/분석용)
CREATE TABLE IF NOT EXISTS run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('START', 'ANSWER', 'CORRECT', 'WRONG', 'END')),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 추천 결과 저장 (선택적)
CREATE TABLE IF NOT EXISTS ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_mode ON runs(mode);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_run_events_run_id ON run_events(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_results_user_id ON ai_results(user_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 로그인한 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own runs" ON runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runs" ON runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs" ON runs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON run_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM runs 
      WHERE runs.id = run_events.run_id 
      AND runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own events" ON run_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM runs 
      WHERE runs.id = run_events.run_id 
      AND runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own ai results" ON ai_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai results" ON ai_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 익명 사용자를 위한 정책 (선택적)
-- 익명 사용자는 user_id가 NULL인 경우만 허용
CREATE POLICY "Anonymous users can insert anonymous runs" ON runs
  FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Public read for anonymous runs" ON runs
  FOR SELECT USING (user_id IS NULL);

-- 통계 뷰 (선택적)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  mode,
  MAX(score) as high_score,
  COUNT(*) as total_games,
  AVG(score) as avg_score
FROM runs
WHERE status = 'ended'
GROUP BY mode;

-- 함수: 게임 종료 시 자동으로 ended_at 업데이트
CREATE OR REPLACE FUNCTION update_ended_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status != 'ended' THEN
    NEW.ended_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ended_at
  BEFORE UPDATE ON runs
  FOR EACH ROW
  EXECUTE FUNCTION update_ended_at();
