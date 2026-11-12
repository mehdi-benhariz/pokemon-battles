import { useMemo, useState, type FC } from 'react';
import { IoClose, IoFilter, IoSearch } from 'react-icons/io5';
import { useTheme } from './ThemeContext';
import { typeChipClasses } from '../lib/pokemonTypeColors';

interface PokemonFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  types: string[];
  onToggleType: (type: string) => void;
  onClearTypes: () => void;
  onClearAll: () => void;
  typeNames: string[];
  resultCount: number;
  isFiltering: boolean;
}

export const PokemonFilterBar: FC<PokemonFilterBarProps> = ({
  query,
  onQueryChange,
  types,
  onToggleType,
  onClearTypes,
  onClearAll,
  typeNames,
  resultCount,
  isFiltering,
}) => {
  const { theme } = useTheme();
  const [typeSearch, setTypeSearch] = useState('');
  const [typesExpanded, setTypesExpanded] = useState(true);

  const filteredTypeNames = useMemo(() => {
    const needle = typeSearch.trim().toLowerCase();
    if (!needle) return typeNames;
    return typeNames.filter(name => name.toLowerCase().includes(needle));
  }, [typeNames, typeSearch]);

  const hasActiveFilters = Boolean(query.trim()) || types.length > 0;

  const panel =
    theme === 'light'
      ? 'bg-white border-[#FED7AA] text-[#9A3412]'
      : 'bg-slate-900/80 border-slate-600 text-slate-100';

  const inputShell =
    theme === 'light'
      ? 'bg-[#FFF7ED] border-[#FED7AA] text-slate-800 placeholder:text-slate-500'
      : 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400';

  return (
    <section
      className={`w-full rounded-2xl border-[3px] p-4 shadow-[4px_4px_0_rgba(249,115,22,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] ${panel}`}
      aria-label="Search and filters"
    >
      <div className="relative">
        <IoSearch
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-orange-500"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search Pokémon by name…"
          aria-label="Search Pokémon by name"
          className={`w-full rounded-xl border-2 py-3 pl-11 pr-11 text-base transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${inputShell}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-orange-100 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Clear search"
          >
            <IoClose className="size-5" aria-hidden />
          </button>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300" aria-live="polite">
        {isFiltering ? (
          <>
            <span className="text-orange-600 dark:text-orange-400">{resultCount}</span> match
            {resultCount === 1 ? '' : 'es'}
            {types.length > 0 ? ' (any selected type)' : ''}
          </>
        ) : (
          <>{resultCount} Pokémon in the catalog</>
        )}
      </p>

      <form
        role="search"
        onSubmit={event => event.preventDefault()}
        onReset={onClearAll}
        className="mt-3 flex flex-wrap gap-2"
      >
        <button
          type="button"
          onClick={() => setTypesExpanded(open => !open)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800 transition-colors hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-200"
          aria-expanded={typesExpanded}
          aria-controls="type-filter-panel"
        >
          <IoFilter aria-hidden />
          Types
          {types.length > 0 && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
              {types.length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="reset"
            className="min-h-11 cursor-pointer rounded-xl border-2 border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Clear all filters
          </button>
        )}
      </form>

      {types.length > 0 && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Showing Pokémon that have <strong>any</strong> of the selected types.
        </p>
      )}

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {query.trim() && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-900 dark:bg-orange-900/50 dark:text-orange-100">
              Name: “{query.trim()}”
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="min-h-8 min-w-8 rounded-full p-1 hover:bg-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Remove name filter"
              >
                <IoClose aria-hidden />
              </button>
            </span>
          )}
          {types.map(type => (
            <span
              key={type}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm capitalize text-blue-900 dark:bg-blue-900/50 dark:text-blue-100"
            >
              {type}
              <button
                type="button"
                onClick={() => onToggleType(type)}
                className="min-h-8 min-w-8 rounded-full p-1 hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Remove ${type} filter`}
              >
                <IoClose aria-hidden />
              </button>
            </span>
          ))}
          {types.length > 1 && (
            <button
              type="button"
              onClick={onClearTypes}
              className="text-sm text-slate-500 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              Clear types
            </button>
          )}
        </div>
      )}

      {typesExpanded && (
        <div id="type-filter-panel" className="mt-4 border-t-2 border-orange-100 pt-4 dark:border-slate-700">
          <label className="sr-only" htmlFor="type-filter-search">
            Filter type list
          </label>
          <input
            id="type-filter-search"
            type="search"
            value={typeSearch}
            onChange={event => setTypeSearch(event.target.value)}
            placeholder="Find a type…"
            className={`mb-3 w-full rounded-lg border-2 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${inputShell}`}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Pokémon types">
            {filteredTypeNames.length === 0 ? (
              <p className="text-sm text-slate-500">No types match “{typeSearch}”.</p>
            ) : (
              filteredTypeNames.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onToggleType(type)}
                  aria-pressed={types.includes(type)}
                  className={typeChipClasses(type, types.includes(type))}
                >
                  {type}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
};
