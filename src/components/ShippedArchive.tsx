import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Task } from '../types';
import { Rocket, Calendar, Eye, FileText, Check, Image, X, ChevronRight, Award, Trophy, FolderArchive } from 'lucide-react';

interface ShippedArchiveProps {
  projects: Project[];
  tasks: Task[];
  onSelectOngoingProject: (projectId: string) => void;
  onGoToDashboard: () => void;
}

export default function ShippedArchive({ projects, tasks, onSelectOngoingProject, onGoToDashboard }: ShippedArchiveProps) {
  const shippedProjects = projects
    .filter((p) => p.status === 'shipped')
    .sort((a, b) => new Date(b.shipped_at || 0).getTime() - new Date(a.shipped_at || 0).getTime());

  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  return (
    <div id="shipped-archive-page" className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-emerald-400" />
            <span>출시함 아카이브 (Hall of Fame)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            완벽을 버리고 완성을 택해 세상에 빛을 보게 된 당신의 자랑스러운 기록들입니다.
          </p>
        </div>
      </div>

      {/* Hero Stats Card */}
      {shippedProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">완성의 주인공</span>
            </div>
            <h2 className="text-lg font-bold text-white">축하합니다! 당신은 이미 창조를 완수해 나가는 사람입니다.</h2>
            <p className="text-slate-400 text-xs max-w-md">
              수많은 미완성 아이디어들이 폴더 속에서 영원히 잠드는 동안, 당신은 마감 기준을 정의하고 실제로 세상을 향해 작업을 쏘아 올렸습니다.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 px-6 py-4 rounded-2xl text-center shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">총 출시 프로젝트</span>
            <span className="text-4xl font-black text-emerald-400 font-mono block mt-1">
              {shippedProjects.length}
            </span>
          </div>
        </motion.div>
      )}

      {/* Shipped List */}
      {shippedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shippedProjects.map((proj, idx) => {
            const completedCount = tasks.filter((t) => t.project_id === proj.project_id).length;
            const shippedDate = proj.shipped_at ? new Date(proj.shipped_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : '알 수 없음';

            return (
              <motion.div
                id={`shipped-card-${proj.project_id}`}
                key={proj.project_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -3, borderColor: 'rgba(16, 185, 129, 0.3)' }}
                onClick={() => setSelectedProj(proj)}
                className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer flex flex-col justify-between h-40 group relative overflow-hidden"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-md font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {proj.name}
                    </h3>
                    <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-1">
                    {proj.description || '작성된 개요가 없습니다.'}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-800/40 text-[11px] text-slate-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>출시일: {shippedDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition-colors font-sans font-bold">
                    <span>상세보기</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <FolderArchive className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-slate-300 font-bold text-lg">아카이브가 비어 있습니다.</h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            아직 마감 기준선(DoD)을 모두 클리어하고 출시 버튼을 누른 프로젝트가 없습니다. 대시보드로 돌아가 오늘의 작은 한 수(태스크)부터 하나씩 마무리를 지어 보세요.
          </p>
          <button
            onClick={onGoToDashboard}
            className="mt-6 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold py-3 px-5 rounded-xl text-emerald-400 transition cursor-pointer"
          >
            <span>대시보드로 이동</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Shipped Detail Read-only Drawer/Modal */}
      <AnimatePresence>
        {selectedProj && (
          <div id="shipped-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProj(null)}
                className="absolute top-5 right-5 p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:text-white text-slate-400 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl shrink-0">
                  <Rocket className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                    출시 완료
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1.5">{selectedProj.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    기획일: {new Date(selectedProj.created_at).toLocaleDateString()} | 출시일: {selectedProj.shipped_at ? new Date(selectedProj.shipped_at).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProj.description && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300 block mb-1">기획 개요</span>
                  {selectedProj.description}
                </div>
              )}

              {/* Before & After Side-by-Side (Polished Display) */}
              {(selectedProj.before_image || selectedProj.after_image) && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                    <Image className="w-3.5 h-3.5" />
                    <span>비포 & 애프터 시각 자료</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProj.before_image && (
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 block text-center mb-1.5">BEFORE</span>
                        <div className="h-44 rounded-xl overflow-hidden bg-black/40">
                          <img src={selectedProj.before_image} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                    {selectedProj.after_image && (
                      <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                        <span className="text-[10px] font-bold text-emerald-400 block text-center mb-1.5">AFTER</span>
                        <div className="h-44 rounded-xl overflow-hidden bg-black/40">
                          <img src={selectedProj.after_image} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipped Notes (Retro) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>출시 회고록 및 일기</span>
                </span>
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line italic">
                  &quot;{selectedProj.description ? (tasks.find(t => t.project_id === selectedProj.project_id && t.done)?.updated_at ? '완성을 돌파한 위대한 기록입니다.' : '') : ''}
                  {/* We can search or look for any progress log note on the shipping day! If none, output fallback */}
                  {selectedProj.name && (
                    <span>
                      완벽주의의 고리를 끊어내고 무사히 출시를 마무리했습니다. 이 정도면 충분히 훌륭합니다! 다음 창조적 사이드 프로젝트로 나아가 완벽주의를 부수어보세요.
                    </span>
                  )}
                  &quot;
                </div>
              </div>

              {/* DoD Review */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>돌파한 마감 세부 기준 (DoD)</span>
                </span>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  {selectedProj.definition_of_done.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-4.5 h-4.5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="font-medium text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close btn container */}
              <button
                onClick={() => setSelectedProj(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                상세 뷰 닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
