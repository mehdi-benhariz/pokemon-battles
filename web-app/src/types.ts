export interface PokemonType {
	name: string
	image: string
}

export interface PokemonSummary {
	id: number
	name: string
	image: string
	stats: {
		HP: number
		attack: number
		defense: number
		speed: number
	}
	apiTypes: PokemonType[]
}
