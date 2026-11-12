import type { FC } from 'react';
import { useTheme } from './ThemeContext';

export const CardSkeleton: FC = () => {
  const { theme } = useTheme();
  const inner = theme === 'light' ? 'bg-white/90' : 'bg-slate-700/90';

  return (
    <div
      className="w-full max-w-[250px] rounded-2xl border-[3px] border-amber-200 p-1 shadow-md dark:border-slate-600"
      aria-hidden
    >
      <div className={`rounded-xl p-4 ${inner}`}>
        <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-amber-200 dark:bg-slate-600" />
        <div className="mx-auto mb-3 aspect-square w-28 animate-pulse rounded-xl bg-amber-100 dark:bg-slate-600" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-amber-100 dark:bg-slate-600" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-amber-100 dark:bg-slate-600" />
        </div>
      </div>
    </div>
  );
};
