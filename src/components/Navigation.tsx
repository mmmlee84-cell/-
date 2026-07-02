import React from 'react';
import { LayoutDashboard, Folder, Rocket, Flame, Database, PlusCircle } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewProjectClick: () => void;
}

export default function Navigation({ currentTab, setCurrentTab, onNewProjectClick }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'projects', label: '프로젝트 목록', icon: Folder },
    { id: 'shipped', label: '출시함 아카이브', icon: Rocket },
    { id: 'progress', label: '진척 대시보드', icon: Flame },
    { id: 'data', label: '데이터 관리', icon: Database },
  ];

  return (
    <nav id="sidebar-navigation" className="w-full md:w-64 bg-slate-900 md:h-screen text-slate-100 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 shrink-0">
      {/* Brand & Top Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-500 text-slate-900 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Rocket className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Ship It <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-medium">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">완벽주의 해독제</p>
          </div>
        </div>

        {/* Create Project CTA Button */}
        <button
          id="btn-nav-new-project"
          onClick={onNewProjectClick}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-emerald-500/20 text-sm cursor-pointer mb-6"
        >
          <PlusCircle className="w-5 h-5" />
          <span>새 프로젝트 시작</span>
        </button>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border-l-4 border-emerald-500 pl-3'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/40 hidden md:block">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          &quot;이 정도면 됐어, 이제 내보내&quot;<br />
          <span className="font-semibold text-slate-400">Done is better than perfect.</span>
        </p>
      </div>
    </nav>
  );
}
