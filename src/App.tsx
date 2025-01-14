import WeatherApp from "./components/weather-app";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WeatherApp />
    </ThemeProvider>
  );
}
