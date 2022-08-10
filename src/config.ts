'use strict'

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '.env') })

interface IConfig {
	port: number
	min_threads: number
	max_threads: number
	ketcher_url: string
}

function configure(): IConfig {
	return {
		port: parseInt(process.env['CONFIG_PORT'] || '9000'),
		min_threads: parseInt(process.env['CONFIG_MIN_WORKERS'] || '1'),
		max_threads: parseInt(process.env['CONFIG_MAX_WORKERS'] || '4'),
		ketcher_url: process.env['CONFIG_KETCHER_URL'] || 'http://eln/ketcher'
	}
}

export { IConfig, configure }
