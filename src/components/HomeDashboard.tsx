import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Project, Task, ProgressLog } from '../types';
import { calculateStats } from '../utils/streak';
import { Flame, Rocket, CheckCircle2, ArrowRight, Sparkles, FolderOpen, AlertCircle, PlusCircle, Calendar } from 'lucide-react';

interface HomeDashboardProps {
  projects: Project[];
  tasks: Task[];
  progress: ProgressLog[];
  onSelectProject: (projectId: string) => void;
  onNewProjectClick: () => void;
  onToggleTask: (taskId: string) => void;
}

export default function HomeDashboard({
  projects,
  tasks,
  progress,
  onSelectProject,
  onNewProjectClick,
  onToggleTask,
}: HomeDashboardProps) {
  const ongoingProjects = projects.filter((p) => p.status === 'ongoing');
  const stats = calculateStats(projects, tasks, progress);

  // Find next single step (다음 한 수) for each ongoing project
  const projectNextSteps = ongoingProjects.map((project) => {
    // Sort tasks by order or naturally
    const projectTasks = tasks
      .filter((t) => t.project_id === project.project_id)
      .sort((a, b) => a.order - b.order);
    
    const nextTask = projectTasks.find((t) => !t.done);
    const completedCount = projectTasks.filter((t) => t.done).length;
    const totalCount = projectTasks.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      project,
      nextTask,
      percent,
      totalCount,
      completedCount,
    };
  }).filter(item => item.nextTask !== undefined); // only show projects that have a remaining task

  // Pick the primary "다음 한 수" (the first one, or most recently updated)
  const primaryStep = projectNextSteps[0];

  // Get active streak level description
  const getStreakMotto = (streak: number) => {
    if (streak === 0) return '완벽이라는 족쇄를 풀고 오늘 첫 발걸음을 떼어보세요.';
    if (streak < 3) return '좋은 출발입니다! 완벽 대신 완성을 향해 한 걸음 더.';
    if (streak < 7) return '꾸준함이 쌓이고 있습니다. 이미 당신은 해내고 있어요!';
    return '완벽주의 해독 완료! 매일 가볍게 던지는 한 수가 기적을 만듭니다.';
  };

  return (
    <div id="home-dashboard" className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            오늘도 가볍게, <span className="text-emerald-400">완성</span>하기
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            거창한 마무리는 없습니다. 단 하나의 작은 마무리만 있을 뿐입니다.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 font-mono">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
        </div>
      </div>

      {/* Stats Quick Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl">
            <Flame className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">연속 달성 스트릭</div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.currentStreak} <span className="text-sm font-normal text-slate-400">일째</span>
            </div>
            <div className="text-[10px] text-amber-500/80 mt-1 font-sans font-medium">
              {getStreakMotto(stats.currentStreak)}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">누적 완료한 할 일</div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalCompletedTasks} <span className="text-sm font-normal text-slate-400 font-sans">개</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              작은 한 수가 모여 하나의 위대한 산이 됩니다.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl">
            <Rocket className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">세상에 공개한 출시물</div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalShipped} <span className="text-sm font-normal text-slate-400 font-sans">개</span>
            </div>
            <div className="text-[10px] text-blue-400 mt-1 font-semibold">
              나는 완벽을 버리고 &quot;완성하는 사람&quot;입니다.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Primary "다음 한 수" Highlight */}
      <div id="featured-next-step">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>오늘의 다음 한 수 (Next Single Step)</span>
        </h2>

        {primaryStep ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                🎯 {primaryStep.project.name}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {primaryStep.nextTask?.title}
              </h3>
              <p className="text-slate-400 text-sm">
                압도당하지 마세요. 오늘 딱 이 일 하나에만 몰입하고 서랍 속에 보관하세요.
              </p>
              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>진행률</span>
                  <span className="font-mono">{primaryStep.percent}% ({primaryStep.completedCount}/{primaryStep.totalCount})</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${primaryStep.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-3 shrink-0">
              <button
                id={`btn-complete-dashboard-task-${primaryStep.nextTask?.task_id}`}
                onClick={() => primaryStep.nextTask && onToggleTask(primaryStep.nextTask.task_id)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-6 rounded-2xl transition duration-200 shadow-lg shadow-emerald-500/10 text-sm cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>오늘 해치우기</span>
              </button>
              <button
                id={`btn-go-project-${primaryStep.project.project_id}`}
                onClick={() => onSelectProject(primaryStep.project.project_id)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-4 px-5 rounded-2xl transition duration-200 text-sm cursor-pointer"
              >
                <span>보드 보러가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : ongoingProjects.length > 0 ? (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">진행 중인 프로젝트의 모든 할 일이 완료되었습니다!</p>
            <p className="text-xs text-slate-500 mt-1">
              마감 체크리스트(Definition of Done)를 작성하고 출시 버튼을 눌러 세상으로 내보내세요.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              {ongoingProjects.map((p) => (
                <button
                  key={p.project_id}
                  onClick={() => onSelectProject(p.project_id)}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-lg text-slate-300 transition"
                >
                  {p.name} 마감하러 가기
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold">현재 활성화된 프로젝트가 없습니다.</p>
            <p className="text-slate-500 text-xs mt-1">완성하지 못했던 크고 작은 작업들을 가볍게 부숴서 등록해보세요.</p>
            <button
              onClick={onNewProjectClick}
              className="mt-4 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl text-emerald-400 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새 프로젝트 만들기</span>
            </button>
          </div>
        )}
      </div>

      {/* Ongoing Projects Summary List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-500" />
            <span>진행 중인 프로젝트 ({ongoingProjects.length})</span>
          </h2>
        </div>

        {ongoingProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ongoingProjects.map((proj) => {
              const projTasks = tasks.filter((t) => t.project_id === proj.project_id).sort((a, b) => a.order - b.order);
              const nextStepTask = projTasks.find((t) => !t.done);
              const completed = projTasks.filter((t) => t.done).length;
              const total = projTasks.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              // Calculate how many DoD checks are completed
              const dodItems = proj.definition_of_done;
              const dodCheckedCount = Object.values(proj.definition_checked || {}).filter(Boolean).length;
              const isDoDAllDone = dodItems.length > 0 && dodCheckedCount === dodItems.length;

              return (
                <motion.div
                  id={`project-summary-card-${proj.project_id}`}
                  whileHover={{ y: -3 }}
                  key={proj.project_id}
                  onClick={() => onSelectProject(proj.project_id)}
                  className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between h-44"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-md font-bold text-white truncate">{proj.name}</h3>
                      {isDoDAllDone && (
                        <span className="shrink-0 bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          출시 가능!
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-1">{proj.description || '설명이 없습니다.'}</p>
                  </div>

                  <div className="space-y-3">
                    {/* Next step hint */}
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/40 text-[11px] flex justify-between gap-2">
                      <span className="text-slate-500">다음 수:</span>
                      <span className="text-slate-300 font-medium truncate text-right flex-1">
                        {nextStepTask ? nextStepTask.title : '🎉 모든 할 일 마침! 마감 단계 진입'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>작업 진행도</span>
                        <span className="font-mono">{pct}% ({completed}/{total})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 text-center text-slate-500 text-sm">
            진행 중인 프로젝트가 존재하지 않습니다.
          </div>
        )}
      </div>

      {/* Safety Alert (Privacy banner as requested in security section of PRD) */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300">🔒 완전한 프라이버시 및 무설치 데이터 보관</p>
          <p className="mt-0.5">
            본 앱은 로그인이나 서버 저장을 요구하지 않습니다. 모든 데이터는 오직 당신의 웹 브라우저 로컬 저장소
            (<span className="font-mono text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">localStorage</span>)에만 안전하게 기록됩니다.
            주기적인 백업을 위해 <span className="font-semibold text-slate-300">&quot;데이터 관리&quot;</span> 탭에서 엑셀 파일(.xlsx)로 데이터를 컴퓨터에 보관해 두세요.
          </p>
        </div>
      </div>
    </div>
  );
}
