import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { RouterProvider } from 'react-router-dom';
import { theme } from './theme';
import { router } from './router';
import { AuthProvider } from './hooks/useAuth';

if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('No root element found');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: {
            scrollbarWidth: 'none',
          },
          '::-webkit-scrollbar': {
            display: 'none',
          },
          '.driver-popover.dance-onboarding': {
            borderRadius: '16px',
            padding: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          },
          '.driver-popover.dance-onboarding .driver-popover-title': {
            fontSize: '18px',
            fontWeight: 700,
            color: '#111111',
            letterSpacing: '-0.01em',
          },
          '.driver-popover.dance-onboarding .driver-popover-description': {
            fontSize: '14px',
            color: '#3f3f46',
            lineHeight: 1.6,
          },
          '.driver-popover.dance-onboarding .driver-popover-next-btn': {
            backgroundColor: '#111111',
            color: '#ffffff',
            borderRadius: '999px',
            border: 'none',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textShadow: 'none',
          },
          '.driver-popover.dance-onboarding .driver-popover-prev-btn': {
            backgroundColor: 'transparent',
            color: '#111111',
            borderRadius: '999px',
            border: '1px solid rgba(0,0,0,0.15)',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textShadow: 'none',
          },
          '.driver-popover.dance-onboarding .driver-popover-close-btn': {
            color: '#71717a',
          },
          '.driver-popover.dance-onboarding .driver-popover-progress-text': {
            color: '#a1a1aa',
            fontSize: '12px',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        }}
      />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
