import fs from 'fs/promises'
import path from 'path'
import type { Request, Response } from 'express'
import { toMarkdown } from '../markdown'
import { fetchPokemon } from './pokeapi'
import { POKEMON_COUNT, parsePokemonId } from '../validation/pokemon'

const EXPORT_DIR = path.join(__dirname, '../../pokemons-ru')

export const exportAll = async (_req: Request, res: Response) => {
	await fs.mkdir(EXPORT_DIR, { recursive: true })
	const ids = Array.from({ length: POKEMON_COUNT }, (_, index) => index + 1)
	let next = 0
	const writeOne = async () => {
		while (next < ids.length) {
			const id = ids[next++]
			const pokemon = await fetchPokemon(String(id))
			await fs.writeFile(
				path.join(EXPORT_DIR, `${id}-${pokemon.slug}.md`),
				toMarkdown(pokemon)
			)
		}
	}
	await Promise.all(Array.from({ length: 8 }, () => writeOne()))
	return res.status(200).send({ count: POKEMON_COUNT })
}

export const downloadOne = async (req: Request, res: Response) => {
	const id = parsePokemonId(req.params.pokemonId)
	if (id === null) {
		return res.status(400).send({ error: 'Pokemon id must be an integer from 1 to 898' })
	}

	const pokemon = await fetchPokemon(String(id))
	res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
	res.setHeader('Content-Disposition', `attachment; filename="${pokemon.slug}.md"`)
	return res.send(toMarkdown(pokemon))
}
