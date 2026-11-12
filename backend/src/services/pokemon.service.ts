import type { Request, Response } from 'express'
import { pokemonIdParam, pokemonListQuery } from '../validation/pokemon'
import { fetchPokemon, fetchPokemonTypeNames, listSummaries } from './pokeapi'

export const list = async (req: Request, res: Response) => {
	const parsed = pokemonListQuery.safeParse(req.query)
	if (!parsed.success) {
		return res.status(400).send({ error: 'Invalid list query' })
	}

	const { page, limit, name, types } = parsed.data
	const result = await listSummaries({ page, limit, name, types })
	return res.status(200).send(result)
}

export const types = async (_req: Request, res: Response) => {
	const typeNames = await fetchPokemonTypeNames()
	return res.status(200).send({ types: typeNames })
}

export const getById = async (req: Request, res: Response) => {
	const parsed = pokemonIdParam.safeParse(req.params.id)
	if (!parsed.success) {
		return res.status(400).send({ error: 'Pokemon id must be an integer from 1 to 898' })
	}

	const pokemon = await fetchPokemon(String(parsed.data))
	return res.status(200).send({ pokemon })
}
