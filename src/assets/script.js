window.renderMolfile = function renderMolfile(molfile) {
    ketcher.init()
    ketcher.setMolecule(molfile)
    ui.render.update()
    svg = ui.client_area.querySelector('svg')
    svg.querySelectorAll(
        "[style*='display: none'], [opacity='0.0'], desc, defs"
    ).forEach((elem) => elem.remove())
    const { x, y, width: w, height: h } = svg.getBBox()
    const vBox = [x, y, w, h].join(' ')
    svg.setAttribute('viewBox', vBox)
    svg.removeAttribute('height')
    svg.removeAttribute('width')
    svg.prepend(document.createComment(ketcher.getMolfile()))
    svg.prepend(document.createComment('Created by Ketcher Backend Service.'))
    result = svg.outerHTML
    return result
}
