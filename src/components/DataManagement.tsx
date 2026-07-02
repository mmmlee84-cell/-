import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState } from '../types';
import { exportToExcel, importFromExcel } from '../utils/storage';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Info,
  Lock,
  Trash2,
  Calendar
} from 'lucide-react';

interface DataManagementProps {
  appState: AppState;
  onImportState: (newState: AppState) => void;
  onClearAllData: () => void;
}

export default function DataManagement({ appState, onImportState, onClearAllData }: DataManagementProps) {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalProjects = appState.projects.length;
  const totalTasks = appState.tasks.length;
  const totalLogs = appState.progress.length;

  const handleExport = () => {
    try {
      exportToExcel(appState);
      // save download mark in state or similar if needed
    } catch (err: any) {
      alert(`내보내기 도중 실패했습니다: ${err.message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImport(file);
    }
  };

  const processImport = async (file: File) => {
    setImportStatus({ type: null, message: '' });
    if (!file.name.endsWith('.xlsx')) {
      setImportStatus({
        type: 'error',
        message: '잘못된 파일 양식입니다. .xlsx 확장자만 지원합니다.'
      });
      return;
    }

    try {
      const newState = await importFromExcel(file);
      onImportState(newState);
      setImportStatus({
        type: 'success',
        message: '성공! 모든 프로젝트 데이터가 성공적으로 병합 및 복원되었습니다.'
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || '가져오기 도중 예기치 못한 에러가 발생했습니다.'
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImport(file);
    }
  };

  return (
    <div id="data-management-page" className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            <span>데이터 관리 및 백업</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            당신의 기록은 온전히 당신의 것입니다. 로컬 데이터를 보관하고 백업 엑셀 파일로 관리하세요.
          </p>
        </div>
      </div>

      {/* Safety Notice & Privacy */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4.5 h-4.5 text-emerald-500" />
          <span>프라이버시 및 백업 원칙</span>
        </h2>
        <div className="text-xs text-slate-400 space-y-2 leading-relaxed font-sans">
          <p>
            본 앱은 <strong>서버 및 DB가 완전히 부재</strong>하는 오프라인-친화적 정적 호스팅 앱입니다. 
            모든 활동과 기획 정보는 100% 브라우저의 내부 저장소(<span className="font-mono text-emerald-400">localStorage</span>)에만 존재합니다.
          </p>
          <p className="text-amber-500/80 font-medium">
            ⚠️ 주의: 브라우저 캐시를 모두 소거하거나 인터넷 기록을 지울 시 소중한 프로젝트들이 유실될 우려가 있습니다. 
            주기적으로 엑셀 백업을 다운로드받아 보관하세요.
          </p>
        </div>
      </div>

      {/* Current State Stats Summary */}
      <div className="grid grid-cols-3 gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">프로젝트</span>
          <span className="text-md font-extrabold text-white font-mono mt-0.5 block">{totalProjects} 개</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">태스크 수</span>
          <span className="text-md font-extrabold text-white font-mono mt-0.5 block">{totalTasks} 개</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">스트릭 기록</span>
          <span className="text-md font-extrabold text-white font-mono mt-0.5 block">{totalLogs} 행</span>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Card */}
        <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-56">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Download className="w-4.5 h-4.5 text-emerald-400" />
              <span>엑셀로 데이터 내보내기 (.xlsx)</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              현재까지 누적된 모든 프로젝트 기획, 일일 완주 통계, 마감 체크리스트 데이터를 SheetJS 기술 기반의 멀티시트 엑셀 양식으로 변환하여 안전하게 백업합니다.
            </p>
          </div>
          <button
            id="btn-export-excel"
            onClick={handleExport}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>엑셀로 즉시 저장</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-56">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4.5 h-4.5 text-emerald-400" />
              <span>백업 파일에서 불러오기</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              기전에 저장해 두셨던 백업 엑셀 파일(.xlsx)을 업로드하여 기존 데이터를 복구하고 이어서 작업합니다.
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed p-3.5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-800 hover:border-emerald-500/20 bg-slate-950/40 hover:bg-slate-950/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>엑셀 백업 파일 올리기 (.xlsx)</span>
            </span>
            <span className="text-[9px] text-slate-600 mt-1">드래그 앤 드롭 또는 클릭</span>
          </div>
        </div>
      </div>

      {/* Import feedback messages */}
      <AnimatePresence mode="wait">
        {importStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              importStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed font-semibold">
              {importStatus.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Operations Section */}
      <div className="border border-red-500/20 bg-red-500/5 p-5 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            <span>위험 구역: 공장 초기화</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            브라우저 로컬 저장소에 기입된 모든 데이터를 완전히 소거하고 초기 템플릿 프로젝트 상태로 되돌립니다. 삭제 전 반드시 백업본을 저장했는지 확인하세요. 이 조작은 복구 불가능합니다.
          </p>
        </div>

        {showClearConfirm ? (
          <div className="flex gap-2.5">
            <button
              id="btn-clear-all-confirm"
              onClick={() => {
                onClearAllData();
                setShowClearConfirm(false);
                setImportStatus({
                  type: 'success',
                  message: '데이터 초기화가 완료되었습니다. 기본 샘플 프로젝트가 설정되었습니다.'
                });
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg text-xs transition cursor-pointer"
            >
              예, 전체 초기화 진행
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg text-xs transition cursor-pointer"
            >
              아니오, 취소
            </button>
          </div>
        ) : (
          <button
            id="btn-clear-all-trigger"
            onClick={() => setShowClearConfirm(true)}
            className="border border-red-500/40 hover:bg-red-500/10 text-red-400 font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            데이터 완전 삭제 및 초기화
          </button>
        )}
      </div>
    </div>
  );
}
