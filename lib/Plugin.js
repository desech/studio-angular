const fs = require('fs')
const File = require('./File.js')
const Template = require('./Template.js')
const ParseCommon = require('./parse/ParseCommon.js')
const ParseCode = require('./parse/ParseCode.js')

module.exports = {
  async syncAppFiles (folder) {
    const source = File.resolve(__dirname, '../dist/my-app')
    const dest = File.resolve(folder, '_export')
    File.createMissingDir(dest)
    const fileTree = File.readFolder(source)
    // we don't want to overwrite the boilerplate files
    await File.syncFolder(fileTree, source, dest, false)
  },

  async syncStaticFolders (data) {
    const dir = File.resolve(data.folder, '_export/src')
    const file = File.resolve(dir, 'styles.css')
    File.writeToFile(file, data.compiledCss.replaceAll('../../', ''))
    // we do want to overwrite all the static files
    await File.syncFolder(data.rootMiscFiles, data.folder, dir)
  },

  syncIndexHtml (folder) {
    const html = Template.getProjectFile(folder, 'index.html')
    const file = File.resolve(folder, '_export/src/index.html')
    File.writeToFile(file, ParseCode.getIndexHtml(html))
  },

  syncJsCode (data, JSDOM) {
    this.syncJsApp(data.folder, data.htmlFiles, 'app', 'getJsAppModule')
    this.syncJsApp(data.folder, data.htmlFiles, 'app-routing', 'getJsAppRouter')
    this.syncJsComponents(data, JSDOM)
    this.syncJsPages(data, JSDOM)
  },

  syncJsApp (folder, htmlFiles, module, callback) {
    const jsFile = `app/${module}.module.ts`
    const file = File.resolve(folder, '_export/src', jsFile)
    const js = fs.existsSync(file) ? File.readFile(file) : Template.getTemplate(jsFile)
    File.writeToFile(file, ParseCode[callback](js, folder, htmlFiles))
  },

  syncJsComponents (data, JSDOM) {
    for (const file of data.htmlFiles) {
      if (file.isComponent) this.syncJsModule(data, file, 'component', JSDOM)
    }
  },

  syncJsPages (data, JSDOM) {
    for (const file of data.htmlFiles) {
      if (!file.isComponent) this.syncJsModule(data, file, 'page', JSDOM)
    }
  },

  syncJsModule (data, file, type, JSDOM) {
    const name = ParseCommon.getClassFile(file.name)
    const cls = ParseCommon.getClassName(file.name)
    const filePath = this.getJsModuleFile(data.folder, file, name)
    this.syncJsModuleFile(filePath, name, cls, '.ts')
    this.syncJsModuleFile(filePath, name, cls, '.spec.ts')
    this.syncJsModuleHtml(filePath + '.html', file, data.compiledCss, JSDOM)
  },

  getJsModuleFile (folder, file, name) {
    const moduleDir = ParseCommon.getModuleDir(folder, file)
    return File.resolve(folder, '_export/src/app', moduleDir, `${name}.component`)
  },

  syncJsModuleFile (filePath, name, cls, ext) {
    if (fs.existsSync(filePath + ext)) return
    const template = Template.getTemplate('component/sample.component' + ext)
    const js = template.replaceAll('FILENAME', name).replaceAll('CLASSNAME', cls)
    File.writeToFile(filePath + ext, js)
  },

  syncJsModuleHtml (filePath, file, css, JSDOM) {
    const html = ParseCode.parseModuleHtml(file, css, JSDOM)
    File.writeToFile(filePath, html)
  }
}
