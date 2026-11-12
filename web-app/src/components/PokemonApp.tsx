import { useDeferredValue, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import PokemonList from './PokemonList';
import { Header } from './Header';
import { useTheme } from './ThemeContext';
import { PokemonFilterBar } from './PokemonFilterBar';
import { BattlePanel } from './BattlePanel';
import { CardSkeleton } from './CardSkeleton';
import { useToast } from './toast/ToastContext';
import { useToastOnCondition } from '../hooks/useToastOnCondition';
import { API_URL, fetchPokemonPage, fetchPokemonTypes, pokemonKeys } from '../api/pokemon';
import type { PokemonSummary } from '../types';

const PAGE_SIZE = 24;

const PokemonApp: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedById, setSelectedById] = useState<Record<number, PokemonSummary>>({});
  const [battle, setBattle] = useState('');
  const [fighting, setFighting] = useState(false);
  const { theme } = useTheme();

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const typesQuery = useQuery({
    queryKey: pokemonKeys.types,
    queryFn: fetchPokemonTypes,
  });
  const typeNames = typesQuery.data ?? [];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isFetchNextPageError,
    refetch,
  } = useInfiniteQuery({
    queryKey: pokemonKeys.list(deferredQuery, types),
    queryFn: ({ pageParam }) =>
      fetchPokemonPage({
        page: pageParam,
        limit: PAGE_SIZE,
        name: deferredQuery,
        types,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  useToastOnCondition(
    isError,
    'Could not load Pokémon. Check that the API is running and try again.'
  );
  useToastOnCondition(typesQuery.isError, 'Could not load Pokémon types.');
  useToastOnCondition(
    isFetchNextPageError,
    'Could not load more Pokémon. Scroll down to try again.'
  );

  const pokemons = data?.pages.flatMap(page => page.pokemons) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const hasActiveFilters = Boolean(deferredQuery) || types.length > 0;

  const chosen = selectedIds
    .map(id => selectedById[id])
    .filter((pokemon): pokemon is PokemonSummary => Boolean(pokemon));

  const toggleType = (type: string) => {
    setTypes(current =>
      current.includes(type) ? current.filter(name => name !== type) : [...current, type]
    );
  };

  const clearAllFilters = () => {
    setQuery('');
    setTypes([]);
  };

  const togglePokemon = (pokemon: PokemonSummary) => {
    setSelectedIds(current => {
      if (current.includes(pokemon.id)) {
        setSelectedById(byId => {
          const next = { ...byId };
          delete next[pokemon.id];
          return next;
        });
        return current.filter(id => id !== pokemon.id);
      }
      if (current.length === 2) return current;
      setSelectedById(byId => ({ ...byId, [pokemon.id]: pokemon }));
      return [...current, pokemon.id];
    });
  };

  const fight = async () => {
    setFighting(true);
    setBattle('');
    try {
      const response = await fetch(`${API_URL}/battle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!response.ok || !response.body) {
        const body = await response.text();
        toast.error(body.trim() || 'The battle could not start.');
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setBattle(text => text + decoder.decode(value, { stream: true }));
      }
      await queryClient.invalidateQueries({ queryKey: pokemonKeys.all });
    } catch {
      toast.error('The battle request failed.');
    } finally {
      setFighting(false);
    }
  };

  const pageBg = theme === 'light' ? 'bg-[#FFF7ED] text-[#9A3412]' : 'bg-slate-900 text-slate-100';

  if (isLoading) {
    return (
      <div className={`${pageBg} flex min-h-screen flex-col items-center`}>
        <Header />
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${pageBg} flex min-h-screen flex-col items-center justify-center gap-4 px-4`}>
        <Header />
        <button
          type="button"
          onClick={() => refetch()}
          className="min-h-11 cursor-pointer rounded-xl bg-orange-500 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`${pageBg} flex min-h-screen flex-col items-center`}>
      <Header/>
      <main className="flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-6">
        <PokemonFilterBar
          query={query}
          onQueryChange={setQuery}
          types={types}
          onToggleType={toggleType}
          onClearTypes={() => setTypes([])}
          onClearAll={clearAllFilters}
          typeNames={typeNames}
          resultCount={total}
          isFiltering={hasActiveFilters}
        />
        <BattlePanel
          chosen={chosen}
          fighting={fighting}
          battle={battle}
          onFight={fight}
        />
        <PokemonList
          pokemons={pokemons}
          selectedIds={selectedIds}
          onSelect={togglePokemon}
          total={total}
          hasMore={hasNextPage ?? false}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      </main>
    </div>
  );
};

export default PokemonApp;
