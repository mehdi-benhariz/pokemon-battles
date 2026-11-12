import cors from 'cors'
import express, { type Express } from 'express'

/** Trust proxy, CORS, and body parsers. */
export function applySecurity(app: Express): void {
	app.disable('x-powered-by')
	app.set('trust proxy', 1)
	app.use(cors({
		origin: true,
		credentials: true,
		exposedHeaders: ['set-cookie']
	}))

	/**
	 * Body parser
	 */
	app.use(express.json({ limit: '50mb' }))
	app.use(express.urlencoded({ extended: true }))
}
