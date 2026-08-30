import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { queryClient } from './query/queryClient';
import './index.css';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/common/ErrorBoundary';
import { clearChunkRetryFlag } from './utils/lazyWithRetry';

import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';

clearChunkRetryFlag();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <ErrorBoundary>
              <AppRouter />
            </ErrorBoundary>
          </MotionConfig>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
