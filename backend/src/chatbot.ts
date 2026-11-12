import type { Response } from 'express'

export const CHATBOT_TOKEN = ''
export const CHATBOT_ID = ''

const CHATBOT_URL = 'https://chatbot-api.getvirtualbrain.com'

interface ChatQueryResponse {
	assistantMessage?: { content?: string }
	content?: string
}

export async function streamBattle(prompt: string, res: Response): Promise<void> {
	if (!CHATBOT_TOKEN || !CHATBOT_ID) {
		res.status(500).send('Set CHATBOT_TOKEN and CHATBOT_ID in backend/src/chatbot.ts')
		return
	}

	const upstream = await fetch(`${CHATBOT_URL}/v1/chats/${CHATBOT_ID}/query`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${CHATBOT_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query: prompt })
	})

	if (!upstream.ok || !upstream.body) {
		res.status(upstream.status || 502).send(await upstream.text())
		return
	}

	res.setHeader('Content-Type', 'text/plain; charset=utf-8')
	const type = upstream.headers.get('content-type') ?? ''
	// shortcut: a JSON body is one blob, not tokens; pipe only when the reply is not JSON
	if (type.includes('application/json')) {
		const body = await upstream.json() as ChatQueryResponse
		res.send(body.assistantMessage?.content ?? body.content ?? JSON.stringify(body))
		return
	}

	const reader = upstream.body.getReader()
	const decoder = new TextDecoder()
	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		res.write(decoder.decode(value, { stream: true }))
	}
	res.end()
}
