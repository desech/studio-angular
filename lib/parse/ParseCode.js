const ExtendJS = require('../ExtendJS.js')
const File = require('../File.js')
const ParseCommon = require('./ParseCommon.js')
const ParseRender = require('./ParseRender.js')

module.exports = {
  getIndexHtml (html) {
    html = html.replace(/<base href="">[\s\S]*?<\/script>/g, '<base href="/">')
    html = html.replace(/<link[\s\S]*.css">/g, '<link rel="stylesheet" href="/styles.css">')
    html = html.replace(/<body[\s\S]*<\/body>/g, '<body>\n  <app-root></app-root>\n</body>')
    return html
  },

  getJsAppModule (js, folder, htmlFiles) {
    const imports = this.getFiles(folder, htmlFiles, null, 'getClassImport').join('')
    js = this.injectJs(js, imports, 'import')
    const modules = this.getFiles(folder, htmlFiles, null, 'getAppModuleClass').join('')
    js = this.injectJs(js, modules, 'module', 4)
    return js
  },

  getFiles (folder, files, type, callback) {
    const list = []
    for (const file of files) {
      if (!type || (type === 'page' && !file.isComponent) ||
        (type === 'component' && file.isComponent)) {
        list.push(this[callback](file.path, folder))
      }
    }
    return ExtendJS.unique(list)
  },

  getClassImport (file, folder) {
    const cls = ParseCommon.getClassName(file, folder)
    const clsPath = ParseCommon.getClassPath(file, folder)
    return `import { ${cls}Component } from './${clsPath}'\n`
  },

  getAppModuleClass (file, folder) {
    const cls = ParseCommon.getClassName(file, folder)
    return `    ${cls}Component,\n`
  },

  getJsAppRouter (js, folder, htmlFiles) {
    const imports = this.getFiles(folder, htmlFiles, 'page', 'getClassImport').join('')
    js = this.injectJs(js, imports, 'import')
    const routes = this.getFiles(folder, htmlFiles, 'page', 'getRoutePath').join('')
    js = this.injectJs(js, routes, 'route', 2)
    return js
  },

  getRoutePath (file, folder) {
    let route = file.replace(folder + '/', '')
    if (route.endsWith('index.html')) route = route.replace('index.html', '')
    const cls = ParseCommon.getClassName(file, folder)
    return `  { path: '${route}', component: ${cls}Component },\n`
  },

  injectJs (js, snippet, location, spaces = 0) {
    const regex = new RegExp(`(\\/\\/ desech - start ${location} block\r?\n)` +
      `([\\s\\S]*?)([ ]{${spaces}}\\/\\/ desech - end ${location} block)`, 'g')
    return js.replace(regex, `$1${snippet}$3`)
  },

  getClassCode (file, data, lib) {
    const body = this.getClassBody(file.path)
    return ParseRender.getRenderBlock(body, file, data, lib)
  },

  getClassBody (file) {
    const body = File.readFile(file)
    // components don't have <body>
    if (body.indexOf('<body>') === -1) return body
    const match = /<body>([\s\S]*)<\/body>/g.exec(body)
    return (match && match[1]) ? match[1].trim() : ''
  },

  parseJsModuleCode (destFile, file, data, render, js) {
    const imports = this.getImports(destFile, data.folder)
    js = this.injectJs(js, imports, 'import')
    js = this.injectJs(js, this.getComponentData(render.component), 'data', 4)
    js = this.injectJs(js, this.getPropsCode(file.isComponent, render), 'props', 2)
    return js
  },

  getImports (destFile, folder) {
    const relBase = File.dirname(destFile.replace(File.resolve(folder, '_export/src'), ''))
    return `import DS from '${File.relative(relBase, '/lib/DS.js')}'\n`
  },

  getComponentData (data) {
    this.replaceComponentInstances(data)
    const desech = JSON.stringify(data, null, 2).replace(/(\r\n|\n|\r)/gm, '\n    ')
    return '    const desech = ' + desech + '\n'
  },

  // we have component classes set by ParentOverride.injectComponent() in the `defaults` object
  // and we also have component files coming from Desech Studio in `overrides` and `variants`
  // we have to convert all this to angular selectors
  replaceComponentInstances (data) {
    if (ExtendJS.isEmpty(data)) return
    for (const [name, value] of Object.entries(data)) {
      if (name === 'component') {
        this.addInstance(data, value)
      } else if (typeof value === 'object') {
        this.replaceComponentInstances(value)
      }
    }
  },

  // overrides have "component/file.html", while defaults have "component-foo"
  addInstance (data, value) {
    if (value.startsWith('component/')) {
      data.component = ParseCommon.getSelector(value)
    }
  },

  getPropsCode (isComponent, render) {
    const list = []
    this.addComponentProps(list, isComponent, render.component?.variants)
    this.addDynamicTemplates(list, render.templates)
    list.push('  d: any')
    return list.length ? list.join('\n') + '\n' : ''
  },

  addComponentProps (list, isComponent, variants) {
    if (!isComponent) return
    this.addComponentPropVariants(list, variants)
    list.push("  @Input() 'd-ref': string")
    list.push("  @Input() 'd-overrides': any")
  },

  addComponentPropVariants (list, variants) {
    if (!variants) return
    for (const name of Object.keys(variants)) {
      list.push(`  @Input() 'd-var-${name}': string`)
    }
  },

  addDynamicTemplates (list, templates) {
    if (ExtendJS.isEmpty(templates)) return
    for (const records of Object.values(templates)) {
      for (const val of records) {
        list.push(`  @ViewChild('${val.template}') ${val.template}: TemplateRef<any>`)
      }
    }
  }
}
