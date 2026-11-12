import { z } from 'zod'

export const POKEMON_COUNT = 898

export const pokemonIdParam = z.coerce
	.number()
	.int()
	.min(1)
	.max(POKEMON_COUNT)

export const battleBody = z.object({
	ids: z.tuple([
		pokemonIdParam,
		pokemonIdParam
	])
})

export const parsePokemonId = (value: string) => {
	const result = pokemonIdParam.safeParse(value)
	return result.success ? result.data : null
}

export const pokemonListQuery = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(24),
	name: z.string().trim().optional(),
	types: z
		.string()
		.optional()
		.transform(value => (value ? value.split(',').map(type => type.trim()).filter(Boolean) : []))
})
