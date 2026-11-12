import { type Express } from 'express'
import { BattleController } from '../controllers/BattleController'
import { ContentController } from '../controllers/ContentsController'
import { PokemonController } from '../controllers/PokemonController'

/**
 * Routes
 */
export function registerRoutes(app: Express): void {
	app.use('/pokemons', PokemonController)
	app.use('/contents', ContentController)
	app.use('/battle', BattleController)
	app.get('/ping', (_req, res) => res.status(200).send('pong'))
}
