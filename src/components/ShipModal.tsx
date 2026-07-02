import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { Rocket, Check, X, Sparkles, Image, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

interface ShipModalProps {
  project: Project;
  onClose: () => void;
  onConfirmShip: (projectId: string, note: string, beforeImg?: string, afterImg?: string) => void;
}

export default function ShipModal({ project, onClose, onConfirmShip }: ShipModalProps) {
  const [note, setNote] = useState('');
  const [beforeImage, setBeforeImage] = useState<string | null>(project.before_image || null);
  const [afterImage, setAfterImage] = useState<string | null>(project.after_image || null);
  const [isShipping, setIsShipping] = useState(false);

  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('이미지 크기는 2MB 이하여야 합니다. 로컬 브라우저 최적화를 위해 더 작은 파일을 업로드해주세요.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (type === 'before') {
          setBeforeImage(base64);
        } else {
          setAfterImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShip = () => {
    setIsShipping(true);
    // Mimic shipping transition
    setTimeout(() => {
      onConfirmShip(project.project_id, note.trim(), beforeImage || undefined, afterImage || undefined);
    }, 1500);
  };

  return (
    <div id="ship-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:text-white text-slate-400 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebrating Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-4 rounded-3xl mb-2">
            <Rocket className="w-12 h-12 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">이 정도면 충분히 좋습니다!</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            정의해 두신 모든 마감 기준을 돌파하셨습니다. 완벽의 덫에 빠지지 말고, 이제 세상을 향해 쏘아 올리세요.
          </p>
        </div>

        {/* Reviewing DoD Checklist */}
        <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">최종 통과한 마감 체크리스트</span>
          <div className="space-y-1.5 pt-1">
            {project.definition_of_done.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Before & After Upload Area (Optional/Polished item) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">비포 & 애프터 기록 (선택)</span>
            <span className="text-[10px] text-slate-500 font-sans">로컬 저장소 전용 이미지</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Before Container */}
            <div
              onClick={() => fileInputBeforeRef.current?.click()}
              className="border border-dashed border-slate-800 hover:border-emerald-500/30 bg-slate-950/40 hover:bg-slate-950/90 rounded-2xl p-4 h-28 flex flex-col items-center justify-center cursor-pointer transition text-center"
            >
              <input
                ref={fileInputBeforeRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'before')}
                className="hidden"
              />
              {beforeImage ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group">
                  <img src={beforeImage} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white">비포 수정</span>
                  </div>
                </div>
              ) : (
                <>
                  <Image className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-[11px] text-slate-400 font-bold">초기 버전 (비포)</span>
                  <span className="text-[9px] text-slate-600 mt-0.5">드래그/클릭</span>
                </>
              )}
            </div>

            {/* After Container */}
            <div
              onClick={() => fileInputAfterRef.current?.click()}
              className="border border-dashed border-slate-800 hover:border-emerald-500/30 bg-slate-950/40 hover:bg-slate-950/90 rounded-2xl p-4 h-28 flex flex-col items-center justify-center cursor-pointer transition text-center"
            >
              <input
                ref={fileInputAfterRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'after')}
                className="hidden"
              />
              {afterImage ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group">
                  <img src={afterImage} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white">애프터 수정</span>
                  </div>
                </div>
              ) : (
                <>
                  <Image className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-[11px] text-slate-400 font-bold">최종 완성 (애프터)</span>
                  <span className="text-[9px] text-slate-600 mt-0.5">드래그/클릭</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Shipped Retrospective (Note) */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>출시 소감 및 회고록</span>
          </label>
          <textarea
            id="input-ship-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 드디어 오랫동안 묵혀둔 드로잉을 완성해 세상에 꺼냈다! 디테일은 조금 어설퍼도 완성한 순간의 쾌감은 어떤 것과도 비교할 수 없다. 만족스럽다."
            className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500/50 transition resize-none"
          />
        </div>

        {/* Warning info */}
        <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex gap-2 text-[10px] text-amber-500/80 leading-relaxed font-sans">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>주의:</strong> 출시를 승인하면 본 프로젝트의 상태는 즉시 <strong>공개완료(Shipped)</strong> 상태로 잠기게 되며, &apos;출시함 아카이브&apos; 명예의 전당으로 이동됩니다.
          </span>
        </div>

        {/* Action button */}
        <button
          id="btn-confirm-final-ship"
          disabled={isShipping}
          onClick={handleShip}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl transition duration-300 shadow-xl shadow-emerald-500/10 cursor-pointer disabled:opacity-55"
        >
          {isShipping ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>세상에 출시하는 중...🚀</span>
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5 animate-pulse text-slate-950" />
              <span className="text-sm font-bold">완성된 작업 세상에 선보이기 (Ship It!)</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
