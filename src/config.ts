// initalize config based on process env
const config = {
	port: Number(process.env['PORT']),
	ketcherURL: process.env['KETCHER_URL'],
	chromiumExecutablePath: process.env['CHROMIUM_EXECUTABLE_PATH']
}

// then set defaults if not provided
config.port ||= 4000
config.ketcherURL ||= `http://localhost:${config.port}/ketcher/ketcher.html`

const nodeEnv = process.env['NODE_ENV'] ?? 'development'

if (!config.chromiumExecutablePath && (nodeEnv === 'development' || nodeEnv === 'test')) {
	config.chromiumExecutablePath = '/usr/bin/google-chrome-stable'
}

export { config }
