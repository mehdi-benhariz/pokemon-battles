export interface PokemonType {
	name: string
	image: string
}

/** Our API stat field names (values are numbers on each Pokémon). */
export const STAT_KEYS = [
	'HP',
	'attack',
	'defense',
	'special_attack',
	'special_defense',
	'speed'
] as const

export type StatKey = (typeof STAT_KEYS)[number]

export const SUMMARY_STAT_KEYS = ['HP', 'attack', 'defense', 'speed'] as const

export type SummaryStatKey = (typeof SUMMARY_STAT_KEYS)[number]

export type StatBlock = Record<StatKey, number>

export type SummaryStats = Pick<StatBlock, SummaryStatKey>

export type DamageRelation =
	| 'neutral'
	| 'resistant'
	| 'twice_resistant'
	| 'vulnerable'
	| 'twice_vulnerable'
	| 'immune'

export interface Resistance {
	name: string
	damage_multiplier: number
	damage_relation: DamageRelation
}

export interface Ability {
	name: string
	slug: string
}

export interface Evolution {
	name: string
	pokedexId: number
}

export interface Pokemon {
	id: number
	pokedexId: number
	name: string
	image: string
	sprite: string
	slug: string
	stats: StatBlock
	apiTypes: PokemonType[]
	apiGeneration: number
	apiResistances: Resistance[]
	resistanceModifyingAbilitiesForApi: Ability
	apiEvolutions: Evolution[]
	apiPreEvolution: string | 'none'
	apiResistancesWithAbilities: Resistance[]
}

export interface PokemonSummary {
	id: number
	name: string
	image: string
	stats: SummaryStats
	apiTypes: PokemonType[]
}
