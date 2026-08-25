import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query/queryClient';
import './index.css';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/common/ErrorBoundary';
import { clearChunkRetryFlag } from './utils/lazyWithRetry';

import { HelmetProvider } from 'react-helmet-async';

clearChunkRetryFlag();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
