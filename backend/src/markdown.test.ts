import assert from 'node:assert/strict'
import test from 'node:test'
import type { Pokemon } from './types/pokemon'
import { toMarkdown } from './markdown'

const bulbasaur: Pokemon = {
	id: 1,
	pokedexId: 1,
	name: 'bulbasaur',
	image: '',
	sprite: '',
	slug: 'bulbasaur',
	stats: { HP: 45, attack: 49, defense: 49, special_attack: 65, special_defense: 65, speed: 45 },
	apiTypes: [{ name: 'grass', image: '' }, { name: 'poison', image: '' }],
	apiGeneration: 1,
	apiResistances: [{ name: 'fire', damage_multiplier: 2, damage_relation: 'vulnerable' }],
	resistanceModifyingAbilitiesForApi: { name: 'overgrow', slug: 'overgrow' },
	apiEvolutions: [],
	apiPreEvolution: 'none',
	apiResistancesWithAbilities: []
}

test('toMarkdown includes the name and main stats', () => {
	const markdown = toMarkdown(bulbasaur)
	assert.match(markdown, /^# bulbasaur/)
	assert.match(markdown, /HP: 45/)
	assert.match(markdown, /Attack: 49/)
})
