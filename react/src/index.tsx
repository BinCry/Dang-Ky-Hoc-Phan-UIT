import CssBaseline from '@mui/material/CssBaseline';
import { lightBlue } from '@mui/material/colors';
import { StyledEngineProvider, Theme, ThemeProvider, adaptV4Theme, createTheme } from '@mui/material/styles';
import { LicenseManager } from 'ag-grid-enterprise';
import { SnackbarProvider } from 'notistack';
import ReactDOM from 'react-dom';
import { tracker } from './tracker';
import { checkAdBlocker } from './tracking.utils';
import { useDrawerStore, useUtilsStore } from './zus';
import './firebase';
import App from './views/App';

import 'ag-grid-enterprise/styles/ag-grid.css';
import 'ag-grid-enterprise/styles/ag-theme-alpine.css';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export { isProd } from './constants';
export { analytics, db } from './firebase';
export { tracker } from './tracker';

checkAdBlocker().then((hasAdBlocker) => {
  tracker.updateProperty('hasAdBlocker', hasAdBlocker);
  tracker.updateProperty('leftDrawerInitiallyOpen', useDrawerStore.getState().isDrawerOpen);
  useUtilsStore.setState({ hasAdBlocker });
});

LicenseManager.setLicenseKey('I_<3_SCHOOL_NDEwMjMzMzIwMDAwMA==afc05c982fa05a2578eb9cab60c42d78');

const theme = createTheme(
  adaptV4Theme({
    typography: {
      fontFamily: `"Montserrat", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji'`,
    },
    palette: {
      primary: { main: lightBlue[800] },
      secondary: { main: lightBlue[500] },
    },
  }),
);

ReactDOM.render(
  <SnackbarProvider>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </SnackbarProvider>,
  document.getElementById('root'),
);
