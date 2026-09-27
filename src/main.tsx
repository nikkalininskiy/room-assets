// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.tsx';
import { theme } from './theme';
import { AuthProvider } from './context/auth';
import { isDatabaseEmpty, seedDatabase } from './lib/seed';
import './styles/globals.css';

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

async function initDatabase() {
  try {
    const isEmpty = await isDatabaseEmpty();
    if (isEmpty) {
      await seedDatabase();
    }
  } catch (error) {
    console.error('Ошибка инициализации БД:', error);
  }
}

async function initApp() {
  await enableMocking();
  await initDatabase();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}

initApp();