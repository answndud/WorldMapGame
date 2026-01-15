import Link from 'next/link';
import { Globe, MapPin, Users, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-8 h-8 text-blue-400" />
              지리 미니게임
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">세계 지도로 배우는 재미있는 퀴즈</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              세계를 탐험하세요
            </h2>
            <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              3D 지구본, 2D 지도, 그리고 재미있는 퀴즈로 세계 지리를 배워보세요
            </p>
          </div>

          {/* Game Modes */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Mode A: 국가/수도 찾기 */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">국가 위치 찾기</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                3D 지구본을 돌려 국가를 찾거나, 수도의 정확한 위치를 클릭해보세요
              </p>
              <div className="space-y-3">
                <Link 
                  href="/play/a1"
                  className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition-colors shadow-md"
                >
                  Level 1: 3D 지구본으로 국가 찾기
                </Link>
                <Link 
                  href="/play/a2"
                  className="block w-full py-3 px-6 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-500 rounded-lg font-semibold text-center transition-colors"
                >
                  Level 2: 수도 위치 맞추기
                </Link>
              </div>
            </div>

            {/* Mode B: 인구수 정렬 */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">인구수 맞추기</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                국가들을 인구수가 많은 순서대로 정렬해보세요
              </p>
              <div className="space-y-3">
                <Link 
                  href="/play/b1"
                  className="block w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition-colors shadow-md"
                >
                  Level 1: 3개 국가 정렬
                </Link>
                <Link 
                  href="/play/b2"
                  className="block w-full py-3 px-6 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-500 rounded-lg font-semibold text-center transition-colors"
                >
                  Level 2: 5개 국가 정렬
                </Link>
              </div>
            </div>
          </div>

          {/* Optional AI Mode */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-300 dark:border-amber-500/30 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI 국가 추천 (선택)</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              간단한 설문에 답하고 나에게 맞는 여행지를 AI가 추천해드립니다
            </p>
            <Link 
              href="/ai"
              className="inline-block py-3 px-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-md"
            >
              AI 추천 시작하기
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-slate-600 dark:text-slate-400">
          <p>© 2026 지리 미니게임. Next.js + Supabase로 제작되었습니다.</p>
        </div>
      </footer>
    </div>
  );
}
