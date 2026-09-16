import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 1. Definiamo quali dati saranno disponibili in tutta l'app
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Creiamo il Provider (il componente che avvolgerà l'applicazione)
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Controlliamo se l'utente aveva già salvato una preferenza nel browser, altrimenti di base è light
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Ogni volta che il tema cambia, attacchiamo o stacchiamo la classe dal body
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Hook personalizzato per usare il contesto
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve essere usato all'interno di un ThemeProvider");
  }
  return context;
}