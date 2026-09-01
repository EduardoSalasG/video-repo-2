import { createTheme } from '@mui/material/styles';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#007aff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5856d6',
    },
    background: {
      default: '#f2f2f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1c1e',
      secondary: '#8e8e93',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.018em',
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.012em',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    body1: {
      letterSpacing: '-0.005em',
      lineHeight: 1.5,
    },
    body2: {
      letterSpacing: '-0.003em',
      lineHeight: 1.5,
    },
    caption: {
      letterSpacing: '0.01em',
      lineHeight: 1.35,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: '#f2f2f7',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.9375rem',
          transition: 'transform 120ms ease-out, background-color 120ms ease-out, box-shadow 120ms ease-out',
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
          },
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(120, 120, 128, 0.08)',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0,0,0,0.12)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007aff',
              borderWidth: 1.5,
            },
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
          },
          '& .MuiInputLabel-root': {
            transform: 'translate(16px, 15px) scale(1)',
            '&.Mui-focused, &.MuiFormLabel-filled': {
              transform: 'translate(16px, -8px) scale(0.75)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
        elevation2: {
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          color: '#1c1c1e',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.76)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': {
            color: '#007aff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: 'rgba(120,120,128,0.12)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '10px 10px 0 0',
        },
      },
    },
  },
});
