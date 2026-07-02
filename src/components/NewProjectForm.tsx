import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Task } from '../types';
import { Sparkles, ArrowLeft, ArrowRight, Check, Plus, Trash2, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface NewProjectFormProps {
  onCancel: () => void;
  onCreateProject: (projectData: {
    name: string;
    description: string;
    tasks: string[];
    definitionOfDone: string[];
  }) => void;
}

const DoD_TEMPLATES = [
  {
    category: '🎨 일러스트 / 미술',
    items: ['선화/스케치 드로잉 완료', '채색 및 묘사(명암) 작업 마침', '작가 개인 서명(사인) 추가', '고화질 JPEG/PNG 내보내기']
  },
  {
    category: '💻 개발 / 사이드 프로젝트',
    items: ['핵심 동작 및 오류 검증 완료', '모바일 웹 브라우저 레이아웃 체크', '실제 서비스 서버(Vercel 등) 빌드 및 배포']
  },
  {
    category: '🎵 음악 / 싱어송라이터',
    items: ['보컬/인스트루먼트 녹음 마무리', '악기 볼륨 믹싱 및 마스터링 완료', '데모 음원 파일(MP3/WAV) 내보내기']
  },
  {
    category: '✍️ 글쓰기 / 콘텐츠 제작',
    items: ['맞춤법 및 문장 오류 수정', '콘텐츠에 어울리는 대표 썸네일 설정', '플랫폼에 업로드 및 발행 버튼 누르기']
  }
];

export default function NewProjectForm({ onCancel, onCreateProject }: NewProjectFormProps) {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Tasks list (starts with one empty string or simple task)
  const [taskInputs, setTaskInputs] = useState<string[]>(['최종 목표 달성을 위한 첫 삽 뜨기']);
  
  // DoD checklist items
  const [dodInputs, setDodInputs] = useState<string[]>([]);

  // Validation
  const [error, setError] = useState<string | null>(null);

  // Task adding/deleting
  const handleAddTaskInput = () => {
    setTaskInputs([...taskInputs, '']);
  };

  const handleUpdateTaskInput = (idx: number, val: string) => {
    const updated = [...taskInputs];
    updated[idx] = val;
    setTaskInputs(updated);
  };

  const handleRemoveTaskInput = (idx: number) => {
    if (taskInputs.length === 1) return;
    setTaskInputs(taskInputs.filter((_, i) => i !== idx));
  };

  // DoD adding/deleting
  const handleAddDodInput = () => {
    setDodInputs([...dodInputs, '']);
  };

  const handleUpdateDodInput = (idx: number, val: string) => {
    const updated = [...dodInputs];
    updated[idx] = val;
    setDodInputs(updated);
  };

  const handleRemoveDodInput = (idx: number) => {
    setDodInputs(dodInputs.filter((_, i) => i !== idx));
  };

  const applyTemplate = (items: string[]) => {
    setDodInputs(items);
  };

  // Navigation handlers
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('프로젝트 이름을 입력해 주세요.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const activeTasks = taskInputs.filter(t => t.trim());
      if (activeTasks.length === 0) {
        setError('최소 하나의 할 일을 적어주세요. 거대한 목표를 가볍게 쪼개는 것부터가 시작입니다.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = () => {
    setError(null);
    const finalTasks = taskInputs.filter(t => t.trim());
    const finalDoD = dodInputs.filter(d => d.trim());

    if (finalDoD.length === 0) {
      setError('완벽주의를 극복하기 위해, "이 정도면 세상에 내보내기 충분하다"고 외칠 수 있는 최소 기준(Definition of Done)을 1개 이상 작성해 주세요.');
      return;
    }

    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      tasks: finalTasks,
      definitionOfDone: finalDoD
    });
  };

  return (
    <div id="new-project-wizard" className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">새 프로젝트 설계하기</h1>
          <p className="text-slate-500 text-xs mt-0.5">완성의 원동력은 완벽주의를 내려놓고 가볍게 쪼개는 것에서 나옵니다.</p>
        </div>
      </div>

      {/* Progress Wizard Indicator */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
        {[
          { num: 1, label: '기본 기획' },
          { num: 2, label: '오늘 할 일 쪼개기' },
          { num: 3, label: '충분히 좋다(DoD) 설정' }
        ].map((item) => (
          <div key={item.num} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
              step === item.num
                ? 'bg-emerald-500 text-slate-950 font-black scale-110 shadow-md shadow-emerald-500/10'
                : step > item.num
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {step > item.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.num}
            </div>
            <span className={`text-xs font-semibold ${step === item.num ? 'text-emerald-400' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Error Alert Box */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-400 font-medium leading-relaxed">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Steps Rendering */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase">프로젝트 이름 <span className="text-red-500">*</span></label>
              <input
                id="input-project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 미니 소설 런칭, 웹포트폴리오 배포, 일러스트 올리기"
                className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase">프로젝트 한 줄 설명</label>
              <textarea
                id="input-project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="예: 오랫동안 미뤄왔던 단편 SF 소설 초고를 완성하고 웹 연재처에 정식 등록한다."
                className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition resize-none"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200">할 일을 세부 태스크로 쪼개기</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">거대한 일은 압도감을 줍니다. 하루에 한 번, 가볍게 해치울 수 있는 분량으로 작게 쪼개세요.</p>
              </div>
              <button
                id="btn-add-task-input"
                onClick={handleAddTaskInput}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition cursor-pointer bg-slate-800/40 py-1.5 px-3 rounded-lg border border-slate-700/50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>할 일 추가</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {taskInputs.map((val, idx) => (
                <div key={idx} className="flex gap-2.5 items-center">
                  <span className="text-xs font-mono text-slate-500 w-5 shrink-0 text-center">{idx + 1}</span>
                  <input
                    id={`input-task-${idx}`}
                    type="text"
                    value={val}
                    onChange={(e) => handleUpdateTaskInput(idx, e.target.value)}
                    placeholder={`예: ${idx === 0 ? '전반적인 아웃라인 스케치 작성' : '디테일 브러쉬 디테일링'}`}
                    className="flex-1 bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition"
                  />
                  <button
                    onClick={() => handleRemoveTaskInput(idx)}
                    disabled={taskInputs.length === 1}
                    className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 rounded-xl transition disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-200">마감 기준 정의 (Definition of Done)</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                완벽주의를 끊기 위한 극약처방입니다! <span className="font-semibold text-emerald-400">&quot;이 조건들이 완료되었다면 더 이상 리팩터링이나 묘사를 무한 반복하지 않고 무조건 출시(Ship)한다&quot;</span>고 다짐할 핵심 마감 체크리스트를 정해 보세요.
              </p>
            </div>

            {/* templates panel */}
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">분야별 빠른 마감 템플릿 적용</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {DoD_TEMPLATES.map((tmpl, idx) => (
                  <button
                    id={`btn-template-${idx}`}
                    key={idx}
                    onClick={() => applyTemplate(tmpl.items)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/20 text-slate-300 text-[11px] py-1.5 px-3 rounded-lg transition text-left cursor-pointer font-medium"
                  >
                    {tmpl.category}
                  </button>
                ))}
              </div>
            </div>

            {/* dod inputs list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {dodInputs.map((val, idx) => (
                <div key={idx} className="flex gap-2.5 items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <input
                    id={`input-dod-${idx}`}
                    type="text"
                    value={val}
                    onChange={(e) => handleUpdateDodInput(idx, e.target.value)}
                    placeholder="예: 선화 마침, 오탈자 정정 등"
                    className="flex-1 bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition"
                  />
                  <button
                    onClick={() => handleRemoveDodInput(idx)}
                    className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                id="btn-add-dod-input"
                onClick={handleAddDodInput}
                className="w-full flex items-center justify-center gap-1 text-slate-400 hover:text-emerald-400 text-xs py-2.5 bg-slate-950 hover:bg-slate-900/50 border border-dashed border-slate-800 hover:border-emerald-500/30 rounded-xl transition cursor-pointer font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>커스텀 마감 기준 추가</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
        <button
          onClick={step === 1 ? onCancel : handleBack}
          className="text-slate-400 hover:text-white font-semibold py-2.5 px-5 rounded-xl transition text-sm cursor-pointer hover:bg-slate-900"
        >
          {step === 1 ? '취소' : '이전 단계'}
        </button>

        {step < 3 ? (
          <button
            id="btn-new-project-next"
            onClick={handleNext}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-5 rounded-xl transition text-sm cursor-pointer"
          >
            <span>다음 단계</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-new-project-create"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl transition text-sm cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>설계 완료 및 시작</span>
          </button>
        )}
      </div>
    </div>
  );
}
