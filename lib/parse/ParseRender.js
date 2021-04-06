const ParseCommon = require('./ParseCommon.js')

module.exports = {
  getHtmlBlock (dom) {
    this.injectClassComponents(dom.window.document, dom.window.document)
    const html = dom.window.document.body.innerHTML
    return this.regexHtml(html)
  },

  injectClassComponents (document, container) {
    for (const div of container.querySelectorAll('div.component')) {
      const tag = this.getComponentTag(document, div)
      div.replaceWith(tag)
      this.injectClassComponents(document, tag)
    }
  },

  getComponentTag (document, div) {
    const cls = ParseCommon.getClassFile(div.getAttributeNS(null, 'src'))
    const tag = document.createElementNS('https://www.w3.org/XML/1998/namespace', cls)
    if (div.hasAttributeNS(null, 'data-element-properties')) {
      const props = div.getAttributeNS(null, 'data-element-properties')
      tag.setAttributeNS(null, 'data-element-properties', props)
    }
    tag.innerHTML = div.innerHTML
    return tag
  },

  regexHtml (html) {
    html = html.replace(/<div class="component-children(.*?)><\/div>/g,
      '<ng-content></ng-content>')
    html = html.replace(/ href="/g, ' routerLink="')
    html = this.replaceShortAttributes(html)
    html = this.addElementProperties(html)
    return html
  },

  replaceShortAttributes (html) {
    return html.replace(/ (hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g,
      ' $1')
  },

  addElementProperties (html) {
    // we can't add attributes with setAttributeNS because we allow invalid html/xml attributes
    return html.replace(/(class="([^><]*?)"([^><]*?))?data-element-properties="(.*?)"/g,
      (match, extraBlock, cls, extra, json) => {
        const props = JSON.parse(json.replaceAll('&quot;', '"'))
        const attrs = this.getPropertyAttributes(props, cls)
        return extraBlock ? (attrs + ' ' + extra).trim() : attrs
      }
    )
  },

  getPropertyAttributes (props, cls) {
    const attrs = []
    if (!props.class) attrs.push(`class="${cls}"`)
    for (let [name, value] of Object.entries(props)) {
      value = value.replaceAll('"', '&quot;')
      if (name === 'class') value = ((cls || '') + ' ' + value).trim()
      attrs.push(`${name}="${value}"`)
    }
    return attrs.join(' ')
  }
}
