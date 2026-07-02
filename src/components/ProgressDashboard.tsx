import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Project, Task, ProgressLog } from '../types';
import { calculateStats } from '../utils/streak';
import { Flame, CheckCircle, Trophy, BarChart2, Calendar, Image as ImageIcon, Sliders } from 'lucide-react';

interface ProgressDashboardProps {
  projects: Project[];
  tasks: Task[];
  progress: ProgressLog[];
}

export default function ProgressDashboard({ projects, tasks, progress }: ProgressDashboardProps) {
  const stats = calculateStats(projects, tasks, progress);
  const shippedWithImages = projects.filter(
    (p) => p.status === 'shipped' && (p.before_image || p.after_image)
  );

  const [activeCompareProj, setActiveCompareProj] = useState<Project | null>(
    shippedWithImages.length > 0 ? shippedWithImages[0] : null
  );

  // 1. Generate grid of last 28 days for the Contribution "Grass" (잔디)
  const getContributionGrid = () => {
    const grid = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Find completion log count for this date
      const log = progress.find((p) => p.date === dateStr);
      const count = log ? log.activity_count : 0;
      
      grid.push({
        date: d,
        dateStr,
        count,
        label: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      });
    }
    return grid;
  };

  const contributionGrid = getContributionGrid();

  // 2. Generate stats for last 7 days chart
  const getLast7DaysStats = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = progress.find((p) => p.date === dateStr);
      const count = log ? log.activity_count : 0;
      
      data.push({
        dayName: d.toLocaleDateString('ko-KR', { weekday: 'short' }),
        count,
      });
    }
    return data;
  };

  const last7Days = getLast7DaysStats();
  const maxCountInChart = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <div id="progress-dashboard-page" className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-emerald-400" />
            <span>진척 상세 대시보드</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            당신의 성취는 오직 본인의 성취 기록으로 확인됩니다. 타인의 평가가 아닌 나만의 완주 기록에 집중하세요.
          </p>
        </div>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contribution Map: 잔디 심기 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-3">
            <Calendar className="w-4.5 h-4.5 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase">최근 4주간 완주 잔디밭 (Activity)</h2>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            {/* Grid of boxes */}
            <div className="grid grid-cols-7 gap-2">
              {contributionGrid.map((item, idx) => {
                let colorClass = 'bg-slate-850';
                if (item.count === 1) colorClass = 'bg-emerald-800/60 border border-emerald-600/30';
                if (item.count === 2) colorClass = 'bg-emerald-600/80 border border-emerald-500/40';
                if (item.count >= 3) colorClass = 'bg-emerald-500 text-slate-950 font-bold';

                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all duration-300 group relative cursor-help ${colorClass}`}
                  >
                    {item.count > 0 ? item.count : ''}
                    {/* Tooltip */}
                    <div className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-sans px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      {item.label}: {item.count}개 완료
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend info */}
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-850 rounded-sm" /> 0개</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-800/60 rounded-sm" /> 1개</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-600/80 rounded-sm" /> 2개</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> 3개+</span>
            </div>
          </div>
        </div>

        {/* 7-Day Performance Bar Chart */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-3">
            <BarChart2 className="w-4.5 h-4.5 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase">최근 7일간 데일리 완료 수</h2>
          </div>

          <div className="flex items-end justify-between h-40 pt-4 px-4">
            {last7Days.map((day, idx) => {
              const barHeightPct = (day.count / maxCountInChart) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end flex-1">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}개
                  </span>
                  <div className="w-7 bg-slate-850 hover:bg-emerald-500/80 rounded-t-md transition-all duration-300 relative overflow-hidden" style={{ height: `${day.count > 0 ? barHeightPct * 0.75 : 8}%` }}>
                    {day.count > 0 && <div className="absolute inset-0 bg-emerald-500 animate-pulse opacity-40" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans font-medium">{day.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Before & After Comparative visual section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-white">비포 & 애프터 시각 비교 갤러리</h2>
          </div>
          {shippedWithImages.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">프로젝트 선택:</span>
              <select
                value={activeCompareProj?.project_id || ''}
                onChange={(e) => {
                  const selected = shippedWithImages.find((p) => p.project_id === e.target.value);
                  if (selected) setActiveCompareProj(selected);
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50"
              >
                {shippedWithImages.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {shippedWithImages.length > 0 && activeCompareProj ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual display box side-by-side */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white">{activeCompareProj.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {activeCompareProj.description || '이 프로젝트는 비포 & 애프터 이미지를 등록하여 마쳤습니다. 완성 과정을 통해 나의 실력이 이만큼 나아졌음을 직관적으로 복기해 보세요.'}
              </p>
              <div className="bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">마감 완료 시간</span>
                <span className="text-slate-300 font-mono">
                  {activeCompareProj.shipped_at ? new Date(activeCompareProj.shipped_at).toLocaleString('ko-KR') : '-'}
                </span>
              </div>
            </div>

            {/* Displaying images */}
            <div className="grid grid-cols-2 gap-4">
              {activeCompareProj.before_image && (
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Before</span>
                  <div className="h-56 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={activeCompareProj.before_image} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}
              {activeCompareProj.after_image && (
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block tracking-wider">After</span>
                  <div className="h-56 rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-950 shadow-lg shadow-emerald-500/5">
                    <img src={activeCompareProj.after_image} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="font-semibold text-slate-400">시각 자료 비교 항목이 아직 없습니다.</p>
            <p className="text-slate-600 mt-1 max-w-sm mx-auto">
              미래의 출시 모달 창에서 &quot;비포 & 애프터&quot; 이미지를 등록하고 완료하면 여기에 멋진 시각적 변천사가 기록됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
