import React from 'react';
import { useTheme } from './ThemeContext';
import { IoIosSunny } from "react-icons/io";
import { IoIosMoon } from "react-icons/io";

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-orange-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? <IoIosMoon aria-hidden /> : <IoIosSunny aria-hidden />}
      <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeSwitcher;
