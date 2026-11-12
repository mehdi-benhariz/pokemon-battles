import type { PokemonSummary } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface PaginatedPokemon {
  pokemons: PokemonSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const pokemonKeys = {
  all: ['pokemons'] as const,
  types: ['pokemons', 'types'] as const,
  list: (name: string, types: string[]) =>
    [...pokemonKeys.all, 'list', name, [...types].sort().join(',')] as const,
};

export async function fetchPokemonTypes(): Promise<string[]> {
  const response = await fetch(`${API_URL}/pokemons/meta/types`);
  if (!response.ok) throw new Error('Could not load types.');
  const body = (await response.json()) as { types: string[] };
  return body.types;
}

export async function fetchPokemonPage(options: {
  page: number;
  limit: number;
  name: string;
  types: string[];
}): Promise<PaginatedPokemon> {
  const params = new URLSearchParams({
    page: String(options.page),
    limit: String(options.limit),
  });
  if (options.name) params.set('name', options.name);
  if (options.types.length) params.set('types', options.types.join(','));

  const response = await fetch(`${API_URL}/pokemons?${params}`);
  if (!response.ok) throw new Error('Could not load Pokémon.');
  return response.json() as Promise<PaginatedPokemon>;
}

export { API_URL };
