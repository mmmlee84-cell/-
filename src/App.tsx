import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Project, Task, ProgressLog } from './types';
import { getInitialState, saveState } from './utils/storage';

// Import Modular Components
import Navigation from './components/Navigation';
import HomeDashboard from './components/HomeDashboard';
import ProjectsList from './components/ProjectsList';
import NewProjectForm from './components/NewProjectForm';
import ProjectBoard from './components/ProjectBoard';
import ShippedArchive from './components/ShippedArchive';
import ProgressDashboard from './components/ProgressDashboard';
import DataManagement from './components/DataManagement';
import ShipModal from './components/ShipModal';

export default function App() {
  // Global Application State
  const [appState, setAppState] = useState<AppState>(() => getInitialState());

  // Navigation: 'dashboard' | 'projects' | 'shipped' | 'progress' | 'data' | 'project-board' | 'project-new'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Ship modal visibility
  const [activeShipProject, setActiveShipProject] = useState<Project | null>(null);

  // Sync state to LocalStorage whenever appState changes
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Handler: Create Project
  const handleCreateProject = (projectData: {
    name: string;
    description: string;
    tasks: string[];
    definitionOfDone: string[];
  }) => {
    const newProjectId = `proj-${Date.now()}`;
    
    // Create Project Object
    const newProject: Project = {
      project_id: newProjectId,
      name: projectData.name,
      description: projectData.description,
      definition_of_done: projectData.definitionOfDone,
      definition_checked: projectData.definitionOfDone.reduce((acc, curr) => {
        acc[curr] = false;
        return acc;
      }, {} as { [key: string]: boolean }),
      status: 'ongoing',
      created_at: new Date().toISOString(),
      shipped_at: null,
    };

    // Create Task Objects
    const newTasks: Task[] = projectData.tasks.map((taskTitle, idx) => ({
      task_id: `task-${Date.now()}-${idx}`,
      project_id: newProjectId,
      title: taskTitle,
      done: false,
      order: idx + 1,
      updated_at: new Date().toISOString()
    }));

    setAppState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
      tasks: [...prev.tasks, ...newTasks]
    }));

    // Auto navigate to the newly created project board
    setSelectedProjectId(newProjectId);
    setCurrentTab('project-board');
  };

  // Handler: Add Inline Task
  const handleAddTask = (projectId: string, title: string) => {
    const projectTasks = appState.tasks.filter(t => t.project_id === projectId);
    const newTask: Task = {
      task_id: `task-${Date.now()}`,
      project_id: projectId,
      title,
      done: false,
      order: projectTasks.length + 1,
      updated_at: new Date().toISOString()
    };

    setAppState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  // Handler: Toggle Task Done
  const handleToggleTask = (taskId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let targetProjectId = '';
    let isTaskNowDone = false;

    setAppState((prev) => {
      const updatedTasks = prev.tasks.map((t) => {
        if (t.task_id === taskId) {
          targetProjectId = t.project_id;
          isTaskNowDone = !t.done;
          return { ...t, done: !t.done, updated_at: new Date().toISOString() };
        }
        return t;
      });

      // Update progress logs if task became completed
      let updatedProgress = [...prev.progress];
      if (isTaskNowDone && targetProjectId) {
        const existingLogIndex = updatedProgress.findIndex(
          (p) => p.date === todayStr && p.project_id === targetProjectId
        );

        if (existingLogIndex >= 0) {
          const log = updatedProgress[existingLogIndex];
          updatedProgress[existingLogIndex] = {
            ...log,
            activity_count: log.activity_count + 1
          };
        } else {
          updatedProgress.push({
            date: todayStr,
            project_id: targetProjectId,
            activity_count: 1
          });
        }
      }

      return {
        ...prev,
        tasks: updatedTasks,
        progress: updatedProgress
      };
    });
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.task_id !== taskId)
    }));
  };

  // Handler: Toggle DoD Checklist Item
  const handleToggleDoDItem = (projectId: string, item: string) => {
    setAppState((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.project_id === projectId) {
          const checked = { ...p.definition_checked };
          checked[item] = !checked[item];
          return { ...p, definition_checked: checked };
        }
        return p;
      });
      return {
        ...prev,
        projects: updatedProjects
      };
    });
  };

  // Handler: Confirm Shipped
  const handleConfirmShip = (projectId: string, note: string, beforeImg?: string, afterImg?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setAppState((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.project_id === projectId) {
          return {
            ...p,
            status: 'shipped' as const,
            shipped_at: new Date().toISOString(),
            before_image: beforeImg,
            after_image: afterImg
          };
        }
        return p;
      });

      // Create log/note about shipping
      let updatedProgress = [...prev.progress];
      const existingLogIndex = updatedProgress.findIndex(
        (p) => p.date === todayStr && p.project_id === projectId
      );

      if (existingLogIndex >= 0) {
        updatedProgress[existingLogIndex] = {
          ...updatedProgress[existingLogIndex],
          activity_count: updatedProgress[existingLogIndex].activity_count + 1,
          note: note || '프로젝트를 세상에 출시했습니다!'
        };
      } else {
        updatedProgress.push({
          date: todayStr,
          project_id: projectId,
          activity_count: 1,
          note: note || '프로젝트를 세상에 출시했습니다!'
        });
      }

      return {
        ...prev,
        projects: updatedProjects,
        progress: updatedProgress
      };
    });

    setActiveShipProject(null);
    setCurrentTab('shipped');
  };

  // Handler: Import Entire AppState (from Excel)
  const handleImportState = (newState: AppState) => {
    setAppState(newState);
  };

  // Handler: Reset/Clear AppState
  const handleClearAllData = () => {
    localStorage.removeItem('ship_it_app_state');
    // Force reload/retrieve defaults
    const defaults = getInitialState();
    setAppState(defaults);
  };

  // Render core views based on chosen Tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <HomeDashboard
            projects={appState.projects}
            tasks={appState.tasks}
            progress={appState.progress}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setCurrentTab('project-board');
            }}
            onNewProjectClick={() => setCurrentTab('project-new')}
            onToggleTask={handleToggleTask}
          />
        );
      case 'projects':
        return (
          <ProjectsList
            projects={appState.projects}
            tasks={appState.tasks}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setCurrentTab('project-board');
            }}
            onNewProjectClick={() => setCurrentTab('project-new')}
          />
        );
      case 'shipped':
        return (
          <ShippedArchive
            projects={appState.projects}
            tasks={appState.tasks}
            onSelectOngoingProject={(id) => {
              setSelectedProjectId(id);
              setCurrentTab('project-board');
            }}
            onGoToDashboard={() => setCurrentTab('dashboard')}
          />
        );
      case 'progress':
        return (
          <ProgressDashboard
            projects={appState.projects}
            tasks={appState.tasks}
            progress={appState.progress}
          />
        );
      case 'data':
        return (
          <DataManagement
            appState={appState}
            onImportState={handleImportState}
            onClearAllData={handleClearAllData}
          />
        );
      case 'project-new':
        return (
          <NewProjectForm
            onCancel={() => setCurrentTab('dashboard')}
            onCreateProject={handleCreateProject}
          />
        );
      case 'project-board':
        const selectedProj = appState.projects.find((p) => p.project_id === selectedProjectId);
        if (!selectedProj) {
          return (
            <div className="p-6 text-center text-slate-500">
              선택한 프로젝트를 찾을 수 없습니다. 대시보드로 돌아가세요.
            </div>
          );
        }
        return (
          <ProjectBoard
            project={selectedProj}
            tasks={appState.tasks}
            onBack={() => setCurrentTab('projects')}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onToggleDoDItem={handleToggleDoDItem}
            onOpenShipModal={(proj) => setActiveShipProject(proj)}
          />
        );
      default:
        return <div className="p-6 text-white text-center">존재하지 않는 페이지입니다.</div>;
    }
  };

  return (
    <div id="ship-it-app-shell" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedProjectId(null); // clear selected project context on global menu click
        }}
        onNewProjectClick={() => setCurrentTab('project-new')}
      />

      {/* Main View Area */}
      <main className="flex-1 min-w-0 md:h-screen overflow-y-auto bg-slate-950/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + (selectedProjectId || '')}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Shipping Celebratory Overlay Modal */}
      <AnimatePresence>
        {activeShipProject && (
          <ShipModal
            project={activeShipProject}
            onClose={() => setActiveShipProject(null)}
            onConfirmShip={handleConfirmShip}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
