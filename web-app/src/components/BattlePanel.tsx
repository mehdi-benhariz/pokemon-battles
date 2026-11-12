import type { FC } from 'react';
import { IoFlash } from 'react-icons/io5';
import type { PokemonSummary } from '../types';
import { useTheme } from './ThemeContext';

interface BattlePanelProps {
  chosen: PokemonSummary[];
  fighting: boolean;
  battle: string;
  onFight: () => void;
}

export const BattlePanel: FC<BattlePanelProps> = ({
  chosen,
  fighting,
  battle,
  onFight,
}) => {
  const { theme } = useTheme();
  const panel =
    theme === 'light'
      ? 'bg-white border-[#FED7AA]'
      : 'bg-slate-900/80 border-slate-600';

  return (
    <section
      className={`w-full rounded-2xl border-[3px] p-4 shadow-[4px_4px_0_rgba(37,99,235,0.12)] ${panel}`}
      aria-label="Battle"
    >
      <h2 className="font-display text-lg font-semibold text-blue-700 dark:text-blue-300">Arena</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Pick two Pokémon from the grid, then start the battle.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex min-h-11 flex-1 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/80 px-3 py-2 dark:border-orange-800 dark:bg-orange-950/30">
          {chosen.length === 0 && (
            <span className="text-sm text-slate-500">No fighters selected</span>
          )}
          {chosen.map((pokemon, index) => (
            <span key={pokemon.id} className="inline-flex items-center gap-2 text-sm font-medium capitalize">
              {index > 0 && <span className="text-orange-500">vs</span>}
              <img src={pokemon.image} alt="" className="size-8 rounded-lg bg-white object-contain" />
              {pokemon.name}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onFight}
          disabled={chosen.length !== 2 || fighting}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 font-semibold text-white shadow-[0_4px_0_#1d4ed8] transition-all hover:bg-blue-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          <IoFlash aria-hidden />
          {fighting ? 'Battling…' : 'Start battle'}
        </button>
      </div>
      {battle && (
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed dark:border-slate-700 dark:bg-slate-800">
          {battle}
        </pre>
      )}
    </section>
  );
};
