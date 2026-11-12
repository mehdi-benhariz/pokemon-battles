import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { getById, list, types } from '../services/pokemon.service'

const PokemonController = Router()

export type { Pokemon, PokemonSummary } from '../types/pokemon'

PokemonController.get('/', asyncHandler(list))
PokemonController.get('/meta/types', asyncHandler(types))
PokemonController.get('/:id', asyncHandler(getById))

export { PokemonController }
