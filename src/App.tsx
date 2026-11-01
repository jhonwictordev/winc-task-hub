import React, { useState, useEffect } from 'react';
import { TaskHubProvider, useTaskHub } from './context/TaskHubContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CalendarView } from './components/calendar/CalendarView';
import { WincView } from './components/winc/WincView';
import { EvilbearView } from './components/evilbear/EvilbearView';
import { ProspectionView } from './components/prospection/ProspectionView';
import { SettingsView } from './components/settings/SettingsView';
import { FloatingWidgetApp } from './components/reminders/FloatingWidgetApp';
import { QuickCaptureApp } from './components/quickcapture/QuickCaptureApp';
import { NewTaskModal } from './components/calendar/NewTaskModal';
import { TaskDetailModal } from './components/calendar/TaskDetailModal';

const MainLayout: React.FC = () => {
  const { selectedView } = useTaskHub();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0c10] text-[#e2e8f0]">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-hidden flex flex-col bg-[#0b0c10]">
          {selectedView === 'dashboard' && <DashboardOverview />}
          {selectedView === 'calendar' && <CalendarView />}
          {selectedView === 'winc' && <WincView />}
          {selectedView === 'evilbear' && <EvilbearView />}
          {selectedView === 'prospeccao' && <ProspectionView />}
          {selectedView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <NewTaskModal />
      <TaskDetailModal />
    </div>
  );
};

export const App: React.FC = () => {
  const [routeHash, setRouteHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRouteHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dedicated routes for separate Electron windows
  if (routeHash === '#widget') {
    return <FloatingWidgetApp />;
  }

  if (routeHash === '#quick-capture') {
    return <QuickCaptureApp />;
  }

  return (
    <TaskHubProvider>
      <MainLayout />
    </TaskHubProvider>
  );
};

export default App;
