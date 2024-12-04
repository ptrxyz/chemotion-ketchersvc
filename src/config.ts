// initalize config based on process env
const config = {
	port: Number(process.env['PORT']),
	ketcherURL: process.env['KETCHER_URL']
}

// then set defaults if not provided
config.port ||= 4000
config.ketcherURL ||= `http://localhost:${config.port}/ketcher/ketcher.html`

export { config }
