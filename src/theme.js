import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6FA8DC',
      light: '#AED4F2',
      dark: '#3D74A8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F7B267',
    },
    background: {
      default: '#F4F9FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5B7188',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
  },
  spacing: 8,
});

export default theme;
