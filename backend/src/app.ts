import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { applySecurity } from './startup/security'
import { registerRoutes } from './startup/routes'

/** App */
const app = express()
applySecurity(app)
registerRoutes(app)

const port = Number(process.env.PORT) || 3001

/* -------------------------- Start the application ------------------------- */

/**
 * Start server
 */
const httpServer = createServer(app)
httpServer.requestTimeout = 0
httpServer.listen(port, () => {
	console.log('Server started on port:', port)
})
