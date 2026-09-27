import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1d4ed8",
    },
    secondary: {
      main: "#f1f5f9",
    },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});