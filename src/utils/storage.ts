import { Project, Task, ProgressLog, AppState } from '../types';
import * as XLSX from 'xlsx';

const LOCAL_STORAGE_KEY = 'ship_it_app_state';

// Default welcome data to prevent empty state or guide them
export const DEFAULT_PROJECTS: Project[] = [
  {
    project_id: 'sample-project-1',
    name: '🎨 캐릭터 일러스트 SNS 게시',
    description: '서랍 속에 묵혀둔 캐릭터 드로잉을 완성하고 개인 인스타그램에 업로드합니다.',
    definition_of_done: [
      '스케치 및 선화 완료',
      '기본 채색 및 명암 완료',
      '개인 서명(워터마크) 추가',
      'JPEG 300dpi 파일로 내보내기'
    ],
    definition_checked: {
      '스케치 및 선화 완료': true,
      '기본 채색 및 명암 완료': false,
      '개인 서명(워터마크) 추가': false,
      'JPEG 300dpi 파일로 내보내기': false,
    },
    status: 'ongoing',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    shipped_at: null,
  },
  {
    project_id: 'sample-project-2',
    name: '📝 미니 웹사이트 배포',
    description: '단순하지만 완벽한 나만의 링크 모음 페이지를 만들어 라이브합니다.',
    definition_of_done: [
      '모바일 해상도 깨짐 없는지 확인',
      '동작 안하는 더미 링크 삭제',
      'Vercel/Netlify 호스팅 서버 배포 완료'
    ],
    definition_checked: {
      '모바일 해상도 깨짐 없는지 확인': true,
      '동작 안하는 더미 링크 삭제': true,
      'Vercel/Netlify 호스팅 서버 배포 완료': true,
    },
    status: 'shipped',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    shipped_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Shipped 2 days ago
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    task_id: 't1',
    project_id: 'sample-project-1',
    title: '디테일 묘사 (머리카락, 눈동자 채색 보강)',
    done: true,
    order: 1,
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    task_id: 't2',
    project_id: 'sample-project-1',
    title: '배경 그라데이션 및 빛 효과 레이어 추가',
    done: false,
    order: 2,
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    task_id: 't3',
    project_id: 'sample-project-1',
    title: '자글자글한 노이즈 텍스처 오버레이 입히기',
    done: false,
    order: 3,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    task_id: 't4',
    project_id: 'sample-project-1',
    title: '사인 추가 및 하이라이트 레이어 병합',
    done: false,
    order: 4,
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Sample 2 tasks (all completed since it is shipped)
  {
    task_id: 't5',
    project_id: 'sample-project-2',
    title: 'HTML 뼈대 잡기 & 프로필 이미지 세팅',
    done: true,
    order: 1,
    updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    task_id: 't6',
    project_id: 'sample-project-2',
    title: 'Tailwind 로 버튼 hover 효과 및 미세 간격 조정',
    done: true,
    order: 2,
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    task_id: 't7',
    project_id: 'sample-project-2',
    title: 'Vercel 연동 후 DNS 도메인 연결 확인',
    done: true,
    order: 3,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const DEFAULT_PROGRESS: ProgressLog[] = [
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    project_id: 'sample-project-1',
    activity_count: 1,
    note: '인스타 올릴 일러스트 초안 및 기본 선화 완료!'
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    project_id: 'sample-project-2',
    activity_count: 1,
    note: '미니 웹사이트 드디어 배포 런칭 성공!'
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    project_id: 'sample-project-1',
    activity_count: 1,
    note: '머리카락 명암 작업 완료. 무한 묘사의 늪에 빠지지 않게 주의!'
  }
];

export function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
        return {
          projects: parsed.projects,
          tasks: parsed.tasks,
          progress: parsed.progress || []
        };
      }
    }
  } catch (e) {
    console.error('Failed to load storage state:', e);
  }

  // Fallback to default
  const state = {
    projects: DEFAULT_PROJECTS,
    tasks: DEFAULT_TASKS,
    progress: DEFAULT_PROGRESS
  };
  saveState(state);
  return state;
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

// Export state to .xlsx
export function exportToExcel(state: AppState) {
  const wb = XLSX.utils.book_new();

  // 1. Projects sheet
  const projectRows = state.projects.map(p => ({
    project_id: p.project_id,
    name: p.name,
    description: p.description,
    definition_of_done: JSON.stringify(p.definition_of_done),
    definition_checked: JSON.stringify(p.definition_checked),
    status: p.status,
    created_at: p.created_at,
    shipped_at: p.shipped_at || '',
    before_image: p.before_image || '',
    after_image: p.after_image || '',
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectRows);
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Projects');

  // 2. Tasks sheet
  const taskRows = state.tasks.map(t => ({
    task_id: t.task_id,
    project_id: t.project_id,
    title: t.title,
    done: t.done ? 'Y' : 'N',
    order: t.order,
    updated_at: t.updated_at
  }));
  const wsTasks = XLSX.utils.json_to_sheet(taskRows);
  XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');

  // 3. Progress sheet
  const progressRows = state.progress.map(pr => ({
    date: pr.date,
    project_id: pr.project_id,
    activity_count: pr.activity_count,
    note: pr.note || ''
  }));
  const wsProgress = XLSX.utils.json_to_sheet(progressRows);
  XLSX.utils.book_append_sheet(wb, wsProgress, 'Progress');

  // Generate buffer and trigger download
  XLSX.writeFile(wb, `ship_it_data_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Import state from .xlsx
export function importFromExcel(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('파일을 읽을 수 없습니다.');
        }

        const workbook = XLSX.read(data, { type: 'binary' });

        // Validate sheets
        if (!workbook.SheetNames.includes('Projects') || !workbook.SheetNames.includes('Tasks')) {
          throw new Error('필수 시트가 누락되었습니다: "Projects" 및 "Tasks" 시트가 포함된 올바른 엑셀 양식이어야 합니다.');
        }

        // Parse Projects
        const projectsSheet = workbook.Sheets['Projects'];
        const projectsRaw = XLSX.utils.sheet_to_json<any>(projectsSheet);
        const importedProjects: Project[] = [];

        for (const row of projectsRaw) {
          if (!row.project_id || !row.name || !row.status) {
            throw new Error('Projects 시트에 필수 항목(project_id, name, status)이 누락되었거나 부적절한 데이터가 있습니다.');
          }

          let dod: string[] = [];
          let dodChecked: { [item: string]: boolean } = {};
          try {
            dod = row.definition_of_done ? JSON.parse(row.definition_of_done) : [];
            dodChecked = row.definition_checked ? JSON.parse(row.definition_checked) : {};
          } catch {
            // fallback if simple strings
            if (row.definition_of_done) {
              dod = String(row.definition_of_done).split(',').map(s => s.trim());
              dod.forEach(item => {
                dodChecked[item] = false;
              });
            }
          }

          importedProjects.push({
            project_id: String(row.project_id),
            name: String(row.name),
            description: String(row.description || ''),
            definition_of_done: dod,
            definition_checked: dodChecked,
            status: row.status === 'shipped' ? 'shipped' : 'ongoing',
            created_at: row.created_at || new Date().toISOString(),
            shipped_at: row.shipped_at || null,
            before_image: row.before_image || undefined,
            after_image: row.after_image || undefined,
          });
        }

        // Parse Tasks
        const tasksSheet = workbook.Sheets['Tasks'];
        const tasksRaw = XLSX.utils.sheet_to_json<any>(tasksSheet);
        const importedTasks: Task[] = [];

        for (const row of tasksRaw) {
          if (!row.task_id || !row.project_id || !row.title) {
            throw new Error('Tasks 시트에 필수 항목(task_id, project_id, title)이 누락되었거나 부적절한 데이터가 있습니다.');
          }

          importedTasks.push({
            task_id: String(row.task_id),
            project_id: String(row.project_id),
            title: String(row.title),
            done: String(row.done).toUpperCase() === 'Y' || row.done === true || row.done === 'true',
            order: typeof row.order === 'number' ? row.order : 0,
            updated_at: row.updated_at || new Date().toISOString()
          });
        }

        // Parse Progress
        let importedProgress: ProgressLog[] = [];
        if (workbook.SheetNames.includes('Progress')) {
          const progressSheet = workbook.Sheets['Progress'];
          const progressRaw = XLSX.utils.sheet_to_json<any>(progressSheet);
          for (const row of progressRaw) {
            if (row.date && row.project_id) {
              importedProgress.push({
                date: String(row.date),
                project_id: String(row.project_id),
                activity_count: typeof row.activity_count === 'number' ? row.activity_count : 1,
                note: row.note ? String(row.note) : undefined
              });
            }
          }
        }

        resolve({
          projects: importedProjects,
          tasks: importedTasks,
          progress: importedProgress
        });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중에 오류가 발생했습니다.'));
    };
    reader.readAsBinaryString(file);
  });
}
