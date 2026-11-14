import type { Response } from 'express'

const CHATBOT_URL =
	process.env.CHATBOT_URL ?? 'https://chatbot-api.getvirtualbrain.com'
const CHATBOT_ID = process.env.CHATBOT_ID ?? ''
const CHATBOT_TOKEN = process.env.CHATBOT_TOKEN ?? ''

interface TokenPair {
	accessToken: string
	refreshToken: string
	expiresIn: number
	chatbotId: string
}

let session: {
	accessToken: string
	refreshToken: string
	chatbotId: string
	expiresAt: number
} | null = null

async function readToken(response: globalThis.Response): Promise<TokenPair> {
	if (!response.ok) {
		throw new Error(await response.text())
	}
	return response.json() as Promise<TokenPair>
}

async function exchangeApiKey(apiKey: string): Promise<TokenPair> {
	const response = await fetch(`${CHATBOT_URL}/v1/auth/api-key/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ apiKey })
	})
	return readToken(response)
}

async function refreshAccess(refreshToken: string, chatbotId: string): Promise<TokenPair> {
	const response = await fetch(`${CHATBOT_URL}/v1/auth/api-key/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refreshToken, chatbotId })
	})
	return readToken(response)
}

async function bearer(): Promise<{ token: string; chatbotId: string }> {
	if (!CHATBOT_TOKEN.startsWith('vb_ak_')) {
		return { token: CHATBOT_TOKEN, chatbotId: CHATBOT_ID }
	}

	const now = Date.now()
	if (session && session.expiresAt > now + 60_000) {
		return { token: session.accessToken, chatbotId: session.chatbotId }
	}

	const pair = session
		? await refreshAccess(session.refreshToken, session.chatbotId).catch(() =>
				exchangeApiKey(CHATBOT_TOKEN)
			)
		: await exchangeApiKey(CHATBOT_TOKEN)
	session = {
		accessToken: pair.accessToken,
		refreshToken: pair.refreshToken,
		chatbotId: pair.chatbotId,
		expiresAt: now + pair.expiresIn * 1000
	}
	return { token: pair.accessToken, chatbotId: pair.chatbotId || CHATBOT_ID }
}

export async function streamBattle(prompt: string, res: Response): Promise<void> {
	if (!CHATBOT_TOKEN) {
		res.status(500).send('Set CHATBOT_TOKEN in backend/.env')
		return
	}

	let auth: { token: string; chatbotId: string }
	try {
		auth = await bearer()
	} catch (error) {
		const message = error instanceof Error ? error.message : 'VirtualBrain auth failed'
		res.status(502).send(message)
		return
	}
	if (!auth.chatbotId) {
		res.status(500).send('Set CHATBOT_ID in backend/.env')
		return
	}

	const upstream = await fetch(
		`${CHATBOT_URL}/v1/open-completion/${auth.chatbotId}/query`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${auth.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query: prompt })
		}
	)

	if (!upstream.ok || !upstream.body) {
		res.status(upstream.status || 502).send(await upstream.text())
		return
	}

	res.setHeader('Content-Type', 'text/plain; charset=utf-8')
	const reader = upstream.body.getReader()
	const decoder = new TextDecoder()
	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		res.write(decoder.decode(value, { stream: true }))
	}
	res.end()
}
