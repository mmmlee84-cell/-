export interface Project {
  project_id: string;
  name: string;
  description: string;
  definition_of_done: string[]; // List of DoD checklist items
  definition_checked: { [item: string]: boolean }; // Checklist status
  status: 'ongoing' | 'shipped';
  created_at: string;
  shipped_at: string | null;
  before_image?: string; // base64 or object URL (for visual before/after)
  after_image?: string;  // base64 or object URL (for visual before/after)
}

export interface Task {
  task_id: string;
  project_id: string;
  title: string;
  done: boolean;
  order: number;
  updated_at: string;
}

export interface ProgressLog {
  date: string; // YYYY-MM-DD
  project_id: string;
  activity_count: number; // completed tasks count
  note?: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  progress: ProgressLog[];
}
