import { createTheme } from '@mui/material/styles';

export const brand = {
  bg: '#08070d',
  paper: '#0f0d18',
  ink: '#f0f1fa',
  dim: '#a3a4c0',
  accent: '#6e4dff',
  accentHover: '#7f61ff',
  hairline: 'rgba(240, 241, 250, 0.09)',
  hairlineStrong: 'rgba(240, 241, 250, 0.22)',
  display: '"Bodoni Moda Variable", "Bodoni Moda", Didot, "Times New Roman", serif',
};

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: brand.accent,
      contrastText: '#ffffff',
    },
    secondary: {
      main: brand.dim,
      contrastText: '#ffffff',
    },
    background: {
      default: brand.bg,
      paper: brand.paper,
    },
    text: {
      primary: brand.ink,
      secondary: brand.dim,
    },
    divider: brand.hairline,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: brand.display,
      fontWeight: 500,
      letterSpacing: '-0.015em',
      lineHeight: 1.05,
    },
    h2: {
      fontFamily: brand.display,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.1,
    },
    h3: {
      fontFamily: brand.display,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
    },
    h4: {
      fontFamily: brand.display,
      fontWeight: 500,
      letterSpacing: '-0.005em',
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: brand.display,
      fontWeight: 500,
      letterSpacing: '0em',
      lineHeight: 1.25,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    body1: {
      letterSpacing: '-0.002em',
      lineHeight: 1.55,
    },
    body2: {
      letterSpacing: '0em',
      lineHeight: 1.55,
    },
    caption: {
      letterSpacing: '0.01em',
      lineHeight: 1.35,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: brand.bg,
          color: brand.ink,
        },
        '::selection': {
          backgroundColor: brand.accent,
          color: '#ffffff',
        },
        ':focus-visible': {
          outline: `2px solid ${brand.accent}`,
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
          transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          backgroundColor: brand.accent,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: brand.accentHover,
          },
        },
        containedPrimary: {
          backgroundColor: brand.accent,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: brand.accentHover,
          },
        },
        outlined: {
          borderColor: brand.hairlineStrong,
          color: brand.ink,
          '&:hover': {
            borderColor: brand.ink,
            backgroundColor: 'rgba(240, 241, 250, 0.06)',
          },
        },
        text: {
          color: brand.ink,
          '&:hover': {
            backgroundColor: 'rgba(240, 241, 250, 0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'transparent',
            '& fieldset': {
              borderColor: 'rgba(240, 241, 250, 0.16)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(240, 241, 250, 0.32)',
            },
            '&.Mui-focused fieldset': {
              borderColor: brand.accent,
              borderWidth: 1.5,
            },
          },
          '& .MuiInputBase-input': {
            padding: '12px 14px',
          },
          '& .MuiInputLabel-root': {
            color: brand.dim,
            transform: 'translate(14px, 14px) scale(1)',
            '&.Mui-focused, &.MuiFormLabel-filled': {
              transform: 'translate(14px, -7px) scale(0.75)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: 'rgba(240, 241, 250, 0.16)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(240, 241, 250, 0.32)',
          },
          '&.Mui-focused fieldset': {
            borderColor: brand.accent,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: `1px solid ${brand.hairline}`,
          backgroundColor: brand.paper,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: `1px solid ${brand.hairline}`,
          backgroundColor: brand.paper,
          backgroundImage: 'none',
        },
        elevation2: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(8, 7, 13, 0.78)',
          backdropFilter: 'blur(20px) saturate(160%)',
          color: brand.ink,
          boxShadow: 'none',
          borderBottom: `1px solid ${brand.hairline}`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(8, 7, 13, 0.88)',
          backdropFilter: 'blur(20px) saturate(160%)',
          borderTop: `1px solid ${brand.hairline}`,
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: brand.dim,
          '&.Mui-selected': {
            color: brand.accent,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          backgroundColor: 'transparent',
          border: `1px solid ${brand.hairlineStrong}`,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(110, 77, 255, 0.14)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(110, 77, 255, 0.2)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 2,
          backgroundColor: brand.accent,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: brand.dim,
          '&.Mui-selected': {
            color: brand.ink,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${brand.hairline}`,
          backgroundColor: brand.paper,
          backgroundImage: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: brand.ink,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: brand.hairline,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          '&:before': { display: 'none' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: brand.paper,
          border: `1px solid ${brand.hairline}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: brand.paper,
          border: `1px solid ${brand.hairline}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1c1930',
          border: `1px solid ${brand.hairline}`,
          color: brand.ink,
          fontSize: '0.75rem',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: brand.accent,
        },
      },
    },
  },
});
