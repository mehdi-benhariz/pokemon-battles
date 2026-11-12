import type { Request, Response } from 'express'
import { streamBattle } from '../chatbot'
import { fetchPokemon } from './pokeapi'
import { battleBody } from '../validation/pokemon'

export const run = async (req: Request, res: Response) => {
	const parsed = battleBody.safeParse(req.body)
	if (!parsed.success) {
		return res.status(400).send({ error: 'Pick two pokemon' })
	}

	const [a, b] = await Promise.all(parsed.data.ids.map(id => fetchPokemon(String(id))))
	const line = (pokemon: Awaited<ReturnType<typeof fetchPokemon>>) =>
		`${pokemon.name}: types ${pokemon.apiTypes.map(type => type.name).join('/')} HP ${pokemon.stats.HP} Attack ${pokemon.stats.attack} Defense ${pokemon.stats.defense} Speed ${pokemon.stats.speed}.`

	const prompt = [
		`Simulate a short Pokémon battle between ${a.name} and ${b.name}.`,
		line(a),
		line(b),
		'Use their types and stats. Name a winner in the last line.'
	].join('\n')

	await streamBattle(prompt, res)
}
