import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { downloadOne, exportAll } from '../services/contents.service'

const ContentController = Router()

ContentController.get('/all', asyncHandler(exportAll))
ContentController.get('/:pokemonId', asyncHandler(downloadOne))

export { ContentController }
