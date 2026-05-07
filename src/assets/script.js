window.renderMolfile = function renderMolfile(molfile) {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	window.alert = () => {}
	ketcher.init()
	ketcher.setMolecule(molfile)
	ui.render.update()
	const svg = ui.client_area.querySelector('svg')
	if (!svg) throw new Error('Ketcher did not produce an SVG element')
	svg.querySelectorAll("[style*='display: none'], [opacity='0.0'], desc, defs").forEach((elem) =>
		elem.remove()
	)
	const { x, y, width: w, height: h } = svg.getBBox()
	const vBox = [x, y, w, h].join(' ')
	svg.setAttribute('viewBox', vBox)
	svg.removeAttribute('height')
	svg.removeAttribute('width')
	svg.prepend(document.createComment(ketcher.getMolfile()))
	svg.prepend(document.createComment('Created by Ketcher Backend Service.'))
	const result = svg.outerHTML
	return result
}
