import { createBrowserRouter } from 'react-router-dom';
import RequestPage from './pages/RequestPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProjectPortal from './pages/ProjectPortal';
import WebSocketPage from './pages/WebSocketPage';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProjectPortal />, 
  },
  {
    path: '/tester',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <RequestPage />,
      },
      {
        path: 'socket',
        element: <WebSocketPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
]);
