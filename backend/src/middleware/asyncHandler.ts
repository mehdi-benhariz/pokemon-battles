import type { NextFunction, Request, Response, RequestHandler } from 'express'

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export const asyncHandler = (handler: AsyncRouteHandler): RequestHandler =>
	(req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next)
	}

/** Same helper; name matches common Express docs spelling. */
export const AsyncHandler = asyncHandler
