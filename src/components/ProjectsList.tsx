import React from 'react';
import { motion } from 'motion/react';
import { Project, Task } from '../types';
import { Folder, Plus, ChevronRight, CheckSquare, ListTodo, AlertCircle } from 'lucide-react';

interface ProjectsListProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject: (id: string) => void;
  onNewProjectClick: () => void;
}

export default function ProjectsList({ projects, tasks, onSelectProject, onNewProjectClick }: ProjectsListProps) {
  const ongoingProjects = projects.filter(p => p.status === 'ongoing');

  return (
    <div id="projects-list-page" className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Folder className="w-6 h-6 text-emerald-500" />
            <span>진행 중인 프로젝트</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            완벽하지 않아도 좋습니다. 끝마침을 기다리는 아이디어를 관리하세요.
          </p>
        </div>
        <button
          id="btn-projects-list-new"
          onClick={onNewProjectClick}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>새 프로젝트</span>
        </button>
      </div>

      {/* Grid of ongoing projects */}
      {ongoingProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ongoingProjects.map((project, idx) => {
            const projectTasks = tasks.filter(t => t.project_id === project.project_id).sort((a, b) => a.order - b.order);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.done).length;
            const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const nextStepTask = projectTasks.find(t => !t.done);

            // DoD items
            const dodTotal = project.definition_of_done.length;
            const dodChecked = Object.values(project.definition_checked || {}).filter(Boolean).length;
            const isDoDReady = dodTotal > 0 && dodChecked === dodTotal;

            return (
              <motion.div
                id={`project-card-full-${project.project_id}`}
                key={project.project_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, borderColor: 'rgba(16, 185, 129, 0.4)' }}
                onClick={() => onSelectProject(project.project_id)}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 group relative overflow-hidden"
              >
                {/* Visual accent glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />

                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-200 line-clamp-1">
                        {project.name}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-1">
                        {project.description || '설명이 작성되지 않았습니다.'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    생성일: {new Date(project.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Next Step Box */}
                  <div className="bg-slate-950/80 border border-slate-800/50 p-2.5 rounded-xl text-xs flex items-center justify-between gap-3">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md shrink-0">다음 한 수</span>
                    <span className="text-slate-300 font-medium truncate flex-1 text-right">
                      {nextStepTask ? nextStepTask.title : '🎉 모든 할 일 완료! 마감 가능'}
                    </span>
                  </div>

                  {/* Indicators (DoD & Task numbers) */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5 text-slate-500" />
                      할 일: {completedTasks}/{totalTasks}개 ({completionPercent}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                      마감 기준(DoD): {dodChecked}/{dodTotal}개
                      {isDoDReady && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Folder className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-slate-300 font-bold text-lg">진행 중인 프로젝트가 없습니다.</h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            완벽한 타이밍이나 완벽한 실력을 갖추기만을 기약 없이 기다리느라 완수하지 못했던 아까운 아이디어가 있다면 지금 바로 가볍게 던지는 첫 프로젝트로 시작해 보세요.
          </p>
          <button
            onClick={onNewProjectClick}
            className="mt-6 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>첫 프로젝트 시작하기</span>
          </button>
        </div>
      )}
    </div>
  );
}
