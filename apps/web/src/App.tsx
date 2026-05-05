import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from 'sonner';
import GlobalModal from './components/ui/Modal';
import { useUIStore } from './store/uiStore';

function App() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <>
      <RouterProvider router={router} />
      <GlobalModal />
      <Toaster position="top-right" theme="dark" closeButton richColors />
    </>
  );
}

export default App;
