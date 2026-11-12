import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { run } from '../services/battle.service'

const BattleController = Router()

BattleController.post('/', asyncHandler(run))

export { BattleController }
