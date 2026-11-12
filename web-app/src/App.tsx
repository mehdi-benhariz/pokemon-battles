import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeContext";
import { ToastProvider } from "./components/toast/ToastContext";
import PokemonApp from "./components/PokemonApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <PokemonApp/>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
