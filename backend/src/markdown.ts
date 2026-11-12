import type { Pokemon } from './types/pokemon'

export function toMarkdown(pokemon: Pokemon): string {
	const types = pokemon.apiTypes.map(type => type.name).join(', ')
	const stats = [
		`HP: ${pokemon.stats.HP}`,
		`Attack: ${pokemon.stats.attack}`,
		`Defense: ${pokemon.stats.defense}`,
		`Special Attack: ${pokemon.stats.special_attack}`,
		`Special Defense: ${pokemon.stats.special_defense}`,
		`Speed: ${pokemon.stats.speed}`
	].join('\n')
	const resistances = pokemon.apiResistances
		.map(resistance => `- ${resistance.name}: ${resistance.damage_relation} (${resistance.damage_multiplier})`)
		.join('\n')

	return `# ${pokemon.name}
- id: ${pokemon.id}
- types: ${types}
- generation: ${pokemon.apiGeneration}

## Stats
${stats}

## Resistances
${resistances}
`
}
