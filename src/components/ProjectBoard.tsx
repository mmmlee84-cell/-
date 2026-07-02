import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Task } from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  ListTodo,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

interface ProjectBoardProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onAddTask: (projectId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onToggleDoDItem: (projectId: string, item: string) => void;
  onOpenShipModal: (project: Project) => void;
}

export default function ProjectBoard({
  project,
  tasks,
  onBack,
  onAddTask,
  onDeleteTask,
  onToggleTask,
  onToggleDoDItem,
  onOpenShipModal,
}: ProjectBoardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const projectTasks = tasks.filter((t) => t.project_id === project.project_id).sort((a, b) => a.order - b.order);

  const completedCount = projectTasks.filter((t) => t.done).length;
  const totalCount = projectTasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Next Single Step (가장 먼저 마쳐야 할 미완료 태스크)
  const nextSingleStep = projectTasks.find((t) => !t.done);

  // Definition of Done Check
  const dodItems = project.definition_of_done;
  const dodCheckedStatus = project.definition_checked || {};
  const dodCheckedCount = Object.values(dodCheckedStatus).filter(Boolean).length;
  const isDoDAllDone = dodItems.length > 0 && dodCheckedCount === dodItems.length;

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(project.project_id, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <div id="project-board-workspace" className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">진행 중인 프로젝트</span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">{project.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-mono hidden md:flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>기획일: {new Date(project.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>

      {/* Description Banner */}
      {project.description && (
        <div className="bg-slate-900/20 border border-slate-800/60 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300 block mb-1">프로젝트 핵심 개요</span>
          {project.description}
        </div>
      )}

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Focus Next Step & Tasks Board (w-2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured "Next Single Step" Box */}
          <div id="project-featured-step" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
            
            <div className="flex justify-between items-start gap-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 py-1 px-2.5 rounded-md uppercase">
                ⚡️ 오늘의 집중 타겟 (다음 한 수)
              </span>
              <span className="text-xs text-slate-500 font-mono">진행률 {pct}%</span>
            </div>

            <div className="mt-4">
              {nextSingleStep ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-relaxed">{nextSingleStep.title}</h3>
                  <p className="text-slate-400 text-xs">
                    다른 할 일들은 잠시 잊으셔도 괜찮습니다. 오직 이 카드 하나만 해치우고 서랍에 넣는 것에 집중하세요.
                  </p>
                  <button
                    id={`btn-board-complete-featured-task-${nextSingleStep.task_id}`}
                    onClick={() => onToggleTask(nextSingleStep.task_id)}
                    className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>이 할 일 완료하기</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-md font-bold text-slate-200">🎉 축하합니다! 세부 할 일을 모두 완료했습니다.</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    이제 우측 패널의 <span className="font-semibold text-emerald-400">마감 체크리스트(Definition of Done)</span>를 최종 확인한 뒤, 완벽주의를 정면 돌파해 세상에 공개 버튼을 눌러보세요!
                  </p>
                </div>
              )}
            </div>

            {/* Micro Progress Bar */}
            <div className="mt-5 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Detailed Cards Board */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ListTodo className="w-4.5 h-4.5 text-slate-400" />
                <span>전체 할 일 목록 ({projectTasks.length})</span>
              </h2>
            </div>

            {/* Inline Task Creation form */}
            <form onSubmit={handleAddNewTask} className="flex gap-2">
              <input
                id="input-inline-task-title"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="다음으로 해야 할 일을 적고 Enter를 치세요..."
                className="flex-1 bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500/50 transition"
              />
              <button
                id="btn-inline-add-task"
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-emerald-500/20 px-4 py-2.5 rounded-xl transition text-xs font-semibold cursor-pointer"
              >
                추가
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {projectTasks.map((task) => (
                  <motion.div
                    id={`task-item-${task.task_id}`}
                    key={task.task_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      task.done
                        ? 'bg-slate-950/20 border-slate-900 text-slate-500'
                        : 'bg-slate-900/30 border-slate-800 text-slate-200 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <button
                        id={`btn-toggle-task-${task.task_id}`}
                        onClick={() => onToggleTask(task.task_id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 cursor-pointer ${
                          task.done
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'border-slate-700 hover:border-emerald-500/40 text-transparent hover:text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <span className={`text-xs truncate ${task.done ? 'line-through decoration-slate-700' : 'font-medium'}`}>
                        {task.title}
                      </span>
                    </div>

                    <button
                      id={`btn-delete-task-${task.task_id}`}
                      onClick={() => onDeleteTask(task.task_id)}
                      className="p-1.5 hover:bg-slate-800/80 text-slate-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {projectTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  등록된 세부 할 일이 없습니다. 위의 입력창을 통해 가벼운 일들을 채워보세요.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Definition of Done & Big Ship Button (w-1/3) */}
        <div className="space-y-6">
          <div id="board-dod-panel" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
              <h2 className="text-sm font-bold text-white">마감 기준 (DoD Checklist)</h2>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              완벽을 핑계 삼아 공개를 무한히 미루는 병을 고치기 위한 <strong>최소 기준선</strong>입니다. 아래 항목들이 통과되면 주저 없이 출시를 감행하세요.
            </p>

            <div className="space-y-2.5 pt-1">
              {dodItems.map((item, idx) => {
                const isChecked = !!dodCheckedStatus[item];
                return (
                  <label
                    id={`dod-checkbox-label-${idx}`}
                    key={idx}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition text-xs select-none ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-950/80 hover:border-slate-800'
                    }`}
                  >
                    <input
                      id={`dod-checkbox-input-${idx}`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleDoDItem(project.project_id, item)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition mt-0.5 ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-700 text-transparent'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className={isChecked ? 'font-medium' : ''}>{item}</span>
                  </label>
                );
              })}
            </div>

            {/* DoD progress overview */}
            <div className="text-[11px] text-slate-500 flex justify-between font-mono pt-1">
              <span>DoD 만족도</span>
              <span>{dodCheckedCount} / {dodItems.length} ({dodItems.length > 0 ? Math.round((dodCheckedCount / dodItems.length) * 100) : 0}%)</span>
            </div>
          </div>

          {/* Ultimate Ship Button */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold text-slate-300">세상에 내보내기</h3>
              <p className="text-[10px] text-slate-500">마감 기준(DoD)을 모두 통과하면 활성화됩니다.</p>
            </div>

            {isDoDAllDone ? (
              <motion.button
                id="btn-board-ship-active"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenShipModal(project)}
                className="w-full flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4.5 rounded-xl transition duration-300 cursor-pointer shadow-xl shadow-emerald-500/15 text-sm"
              >
                <Award className="w-5 h-5 animate-spin" />
                <span>충분하다! 출시하기 (Ship)</span>
              </motion.button>
            ) : (
              <div
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-400 font-bold py-4 rounded-xl border border-slate-700/40 select-none opacity-60 text-xs"
              >
                <Lock className="w-4 h-4" />
                <span>마감 충족 시 활성화 ({dodCheckedCount}/{dodItems.length})</span>
              </div>
            )}

            {isDoDAllDone && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex gap-2 text-[10px] text-emerald-400 leading-relaxed">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>준비 완료!</strong> 더 이상의 수정은 완벽주의가 부리는 핑계입니다. 충분히 훌륭합니다. 어서 출시 버튼을 눌러 완성의 기쁨을 누리세요!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
