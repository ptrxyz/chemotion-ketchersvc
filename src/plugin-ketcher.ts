import type { BrowserControl } from './render'
import type { Debugger } from 'debug'

import { Elysia, t } from 'elysia'

import { render } from './render'

export const KetcherPlugin = ({ logger, bc }: { logger: Debugger; bc: BrowserControl }) =>
	new Elysia()
		.decorate('log', logger)
		.decorate('bc', bc)
		.get('status', () => 'running')
		.post(
			'/render',
			async ({ log, body, set }) => {
				const maybeSVG = await render(bc, body.molfile)
				if (maybeSVG.startsWith('<svg ')) {
					return { svg: maybeSVG }
				} else {
					log('Broken SVG returned from rendering pipeline.')
					set.status = 'Internal Server Error'
					return { error: 'Broken SVG returned from rendering pipeline.' }
				}
			},
			{
				body: t.Object({
					molfile: t.String()
				})
			}
		)
