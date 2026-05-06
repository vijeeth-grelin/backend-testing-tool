import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
