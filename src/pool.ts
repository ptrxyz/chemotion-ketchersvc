'use strict'

import Piscina from 'piscina'
import { resolve } from 'path'

interface IPiscinaBuildParams {
	min_threads: number
	max_threads: number
	ketcher_url: string
}

function build({ min_threads, max_threads, ketcher_url }: IPiscinaBuildParams): Piscina {
	const piscina = new Piscina({
		filename: resolve(__dirname, 'worker.js'),
		minThreads: min_threads,
		maxThreads: max_threads,
		env: {
			...process.env,
			KETCHER_URL: ketcher_url
		}
	})

	return piscina
}
export { build }
