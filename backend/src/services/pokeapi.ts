import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import type { DamageRelation, Evolution, Pokemon, PokemonSummary, Resistance } from '../types/pokemon'

const POKEAPI_URL = 'https://pokeapi.co/api/v2'
const POKEMON_COUNT = 898
const SUMMARY_CACHE = path.join(__dirname, '../../data/summaries.json')
const pokemonCache = new Map<string, Pokemon>()
const typeIconCache = new Map<string, Promise<string>>()

interface NamedResource {
	name: string
	url: string
}

interface ApiPokemon {
	id: number
	name: string
	sprites: {
		front_default: string | null
		other: { 'official-artwork': { front_default: string | null } }
	}
	stats: { base_stat: number, stat: NamedResource }[]
	types: { slot: number, type: NamedResource }[]
	abilities: { ability: NamedResource }[]
	species: NamedResource
}

interface ApiType {
	name: string
	damage_relations: {
		double_damage_from: NamedResource[]
		half_damage_from: NamedResource[]
		no_damage_from: NamedResource[]
	}
	sprites: { 'generation-viii': { 'sword-shield': { name_icon: string | null } } }
}

interface ApiSpecies {
	name: string
	generation: NamedResource
	evolves_from_species: NamedResource | null
	evolution_chain: { url: string }
}

interface ApiChainLink {
	species: NamedResource
	evolves_to: ApiChainLink[]
}

interface ApiEvolutionChain {
	chain: ApiChainLink
}

const ATTACKING_TYPES = [
	'normal', 'fire', 'water', 'electric', 'grass', 'ice',
	'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
	'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

const DAMAGE_RELATIONS: Record<number, DamageRelation> = {
	0: 'immune',
	0.25: 'twice_resistant',
	0.5: 'resistant',
	1: 'neutral',
	2: 'vulnerable',
	4: 'twice_vulnerable'
}

/** Extract the trailing id from a PokeAPI resource url (e.g. .../generation/1/) */
const idFromUrl = (url: string): number => Number(url.split('/').filter(Boolean).pop())

const baseStat = (pokemon: ApiPokemon, name: string): number =>
	pokemon.stats.find(s => s.stat.name === name)?.base_stat ?? 0

const computeResistances = (types: ApiType[]): Resistance[] =>
	ATTACKING_TYPES.map(attacker => {
		const damage_multiplier = types.reduce((multiplier, { damage_relations: relations }) => {
			if (relations.no_damage_from.some(t => t.name === attacker)) return 0
			if (relations.double_damage_from.some(t => t.name === attacker)) return multiplier * 2
			if (relations.half_damage_from.some(t => t.name === attacker)) return multiplier * 0.5
			return multiplier
		}, 1)

		return { name: attacker, damage_multiplier, damage_relation: DAMAGE_RELATIONS[damage_multiplier] }
	})

const findChainLink = (link: ApiChainLink, speciesName: string): ApiChainLink | undefined =>
	link.species.name === speciesName
		? link
		: link.evolves_to.map(child => findChainLink(child, speciesName)).find(Boolean)

async function get<T>(url: string): Promise<T> {
	for (let attempt = 0; attempt < 5; attempt++) {
		try {
			const { data } = await axios.get<T>(url)
			return data
		} catch (error) {
			const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0
			if ((status !== 429 && status !== 503) || attempt === 4) throw error
			await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)))
		}
	}
	throw new Error(url)
}

const typeIcon = (type: NamedResource): Promise<string> => {
	const cached = typeIconCache.get(type.name)
	if (cached) return cached
	const pending = get<ApiType>(type.url).then(
		data => data.sprites['generation-viii']['sword-shield'].name_icon ?? ''
	)
	typeIconCache.set(type.name, pending)
	return pending
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results = new Array<R>(items.length)
	let next = 0
	const worker = async () => {
		while (next < items.length) {
			const index = next++
			results[index] = await fn(items[index])
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
	return results
}

/**
 * Fetch a pokemon from PokeAPI and adapt it to the legacy pokebuildapi `Pokemon` shape
 */
export async function fetchPokemon(id: string): Promise<Pokemon> {
	const cached = pokemonCache.get(id)
	if (cached) return cached

	const pokemon = await get<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)

	const [types, species] = await Promise.all([
		Promise.all(
			[...pokemon.types]
				.sort((a, b) => a.slot - b.slot)
				.map(({ type }) => get<ApiType>(type.url))
		),
		get<ApiSpecies>(pokemon.species.url)
	])

	const evolutionChain = await get<ApiEvolutionChain>(species.evolution_chain.url)

	const apiEvolutions: Evolution[] = (findChainLink(evolutionChain.chain, species.name)?.evolves_to ?? [])
		.map(({ species: evolution }) => ({ name: evolution.name, pokedexId: idFromUrl(evolution.url) }))

	const apiResistances = computeResistances(types)
	const firstAbility = pokemon.abilities[0]?.ability

	const result: Pokemon = {
		id: pokemon.id,
		pokedexId: pokemon.id,
		name: pokemon.name,
		image: pokemon.sprites.other['official-artwork'].front_default ?? '',
		sprite: pokemon.sprites.front_default ?? '',
		slug: pokemon.name,
		stats: {
			HP: baseStat(pokemon, 'hp'),
			attack: baseStat(pokemon, 'attack'),
			defense: baseStat(pokemon, 'defense'),
			special_attack: baseStat(pokemon, 'special-attack'),
			special_defense: baseStat(pokemon, 'special-defense'),
			speed: baseStat(pokemon, 'speed')
		},
		apiTypes: types.map(type => ({
			name: type.name,
			image: type.sprites['generation-viii']['sword-shield'].name_icon ?? ''
		})),
		apiGeneration: idFromUrl(species.generation.url),
		apiResistances,
		// PokeAPI has no equivalent: best effort with the first ability
		resistanceModifyingAbilitiesForApi: { name: firstAbility?.name ?? '', slug: firstAbility?.name ?? '' },
		apiEvolutions,
		apiPreEvolution: species.evolves_from_species?.name ?? 'none',
		// PokeAPI does not compute ability effects on resistances
		apiResistancesWithAbilities: apiResistances
	}

	pokemonCache.set(id, result)
	return result
}

/** Ids 1–898 (generations 1–8). Disk cache so the next boot skips PokéAPI. */
export async function fetchSummaries(): Promise<PokemonSummary[]> {
	try {
		const cached = JSON.parse(await fs.readFile(SUMMARY_CACHE, 'utf8')) as PokemonSummary[]
		if (cached.length === POKEMON_COUNT) return cached
	} catch {
		// cache miss
	}

	const ids = Array.from({ length: POKEMON_COUNT }, (_, index) => index + 1)
	const summaries = await mapPool(ids, 8, async (id): Promise<PokemonSummary> => {
		const pokemon = await get<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)
		const apiTypes = await Promise.all(
			[...pokemon.types]
				.sort((a, b) => a.slot - b.slot)
				.map(async ({ type }) => ({ name: type.name, image: await typeIcon(type) }))
		)
		return {
			id: pokemon.id,
			name: pokemon.name,
			image: pokemon.sprites.other['official-artwork'].front_default ?? '',
			stats: {
				HP: baseStat(pokemon, 'hp'),
				attack: baseStat(pokemon, 'attack'),
				defense: baseStat(pokemon, 'defense'),
				speed: baseStat(pokemon, 'speed')
			},
			apiTypes
		}
	})

	await fs.mkdir(path.dirname(SUMMARY_CACHE), { recursive: true })
	await fs.writeFile(SUMMARY_CACHE, JSON.stringify(summaries))
	return summaries
}

export interface PaginatedSummaries {
	pokemons: PokemonSummary[]
	page: number
	limit: number
	total: number
	totalPages: number
}

export async function listSummaries(options: {
	page: number
	limit: number
	name?: string
	types?: string[]
}): Promise<PaginatedSummaries> {
	const all = await fetchSummaries()
	const name = options.name?.toLowerCase() ?? ''
	const types = options.types ?? []

	const filtered = all.filter(pokemon => {
		const nameMatches = !name || pokemon.name.toLowerCase().includes(name)
		const typeMatches =
			types.length === 0 || pokemon.apiTypes.some(type => types.includes(type.name))
		return nameMatches && typeMatches
	})

	const total = filtered.length
	const totalPages = Math.max(1, Math.ceil(total / options.limit))
	const page = Math.min(options.page, totalPages)
	const start = (page - 1) * options.limit

	return {
		pokemons: filtered.slice(start, start + options.limit),
		page,
		limit: options.limit,
		total,
		totalPages
	}
}

export async function fetchPokemonTypeNames(): Promise<string[]> {
	const all = await fetchSummaries()
	return [...new Set(all.flatMap(pokemon => pokemon.apiTypes.map(type => type.name)))].sort()
}
