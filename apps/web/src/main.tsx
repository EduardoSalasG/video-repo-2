import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { theme, brand } from './theme';
import { router } from './router';
import { AuthProvider } from './hooks/useAuth';
import '@fontsource-variable/bodoni-moda';
import '@fontsource-variable/bodoni-moda/wght-italic.css';

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
            scrollbarWidth: 'thin',
            scrollbarColor: `${brand.hairlineStrong} transparent`,
          },
          '::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: brand.hairlineStrong,
            borderRadius: 4,
          },
          '::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '.driver-popover.dance-onboarding': {
            borderRadius: '16px',
            padding: '8px',
            backgroundColor: brand.paper,
            border: `1px solid ${brand.hairline}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          },
          '.driver-popover.dance-onboarding .driver-popover-title': {
            fontSize: '18px',
            fontWeight: 700,
            color: brand.ink,
            letterSpacing: '-0.01em',
          },
          '.driver-popover.dance-onboarding .driver-popover-description': {
            fontSize: '14px',
            color: brand.dim,
            lineHeight: 1.6,
          },
          '.driver-popover.dance-onboarding .driver-popover-next-btn': {
            backgroundColor: brand.accent,
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
            color: brand.ink,
            borderRadius: '999px',
            border: `1px solid ${brand.hairlineStrong}`,
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textShadow: 'none',
          },
          '.driver-popover.dance-onboarding .driver-popover-close-btn': {
            color: brand.dim,
          },
          '.driver-popover.dance-onboarding .driver-popover-progress-text': {
            color: brand.dim,
            fontSize: '12px',
          },
          '.driver-popover.dance-onboarding .driver-popover-arrow': {
            display: 'none',
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
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  </StrictMode>
);
