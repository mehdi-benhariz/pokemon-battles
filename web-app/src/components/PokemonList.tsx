import { type FC, useEffect, useRef } from 'react';
import { useTheme } from "./ThemeContext";
import Card from './Card';
import type { PokemonSummary } from "../types";

interface PokemonListProps {
  pokemons: PokemonSummary[];
  selectedIds: number[];
  onSelect: (pokemon: PokemonSummary) => void;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const PokemonList: FC<PokemonListProps> = ({
  pokemons,
  selectedIds,
  onSelect,
  total,
  hasMore,
  isLoadingMore,
  onLoadMore,
  hasActiveFilters,
  onClearFilters,
}) => {
  const { theme } = useTheme();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: '240px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (pokemons.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="font-display text-2xl font-semibold">No Pokémon here</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {hasActiveFilters
            ? 'Nothing matches your search or type filters. Try a shorter name, fewer types, or clear filters.'
            : 'The catalog is empty right now.'}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="min-h-11 cursor-pointer rounded-xl bg-orange-500 px-5 py-2 font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col gap-4 pb-10 ${theme === 'light' ? '' : 'bg-slate-900'}`}>
      <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300 px-4" aria-live="polite">
        {hasMore
          ? `Showing ${pokemons.length} of ${total} — scroll for more`
          : `${total} Pokémon`}
      </p>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 place-items-center gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {pokemons.map((pokemon) => (
          <Card
            key={pokemon.id}
            pokemon={pokemon}
            selected={selectedIds.includes(pokemon.id)}
            onSelect={() => onSelect(pokemon)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6" aria-hidden>
          <span className="animate-pulse text-sm font-medium text-orange-600/80 dark:text-orange-400/80">
            {isLoadingMore ? 'Loading more…' : 'Scroll for more'}
          </span>
        </div>
      )}
    </div>
  );
};

export default PokemonList;
