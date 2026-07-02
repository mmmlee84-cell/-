import { ProgressLog, Project, Task } from '../types';

export interface Stats {
  currentStreak: number;
  totalShipped: number;
  totalCompletedTasks: number;
}

export function calculateStats(projects: Project[], tasks: Task[], progress: ProgressLog[]): Stats {
  const totalShipped = projects.filter(p => p.status === 'shipped').length;
  const totalCompletedTasks = tasks.filter(t => t.done).length;

  // Calculate daily streak
  if (progress.length === 0) {
    return { currentStreak: 0, totalShipped, totalCompletedTasks };
  }

  // Get list of unique dates where activity_count > 0, sorted descending
  const activeDates = Array.from(
    new Set(
      progress
        .filter(p => p.activity_count > 0)
        .map(p => p.date)
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (activeDates.length === 0) {
    return { currentStreak: 0, totalShipped, totalCompletedTasks };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newestDate = activeDates[0];

  // If the latest activity is older than yesterday, streak is broken (0)
  if (newestDate !== todayStr && newestDate !== yesterdayStr) {
    return { currentStreak: 0, totalShipped, totalCompletedTasks };
  }

  let streak = 0;
  let checkDate = new Date(newestDate);

  for (let i = 0; i < activeDates.length; i++) {
    const currentActiveDateStr = activeDates[i];
    const expectedDateStr = checkDate.toISOString().split('T')[0];

    if (currentActiveDateStr === expectedDateStr) {
      streak++;
      // Move checkDate to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak: streak,
    totalShipped,
    totalCompletedTasks
  };
}
