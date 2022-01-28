const fs = require('fs')
const File = require('./File.js')
const Template = require('./Template.js')
const ParseCommon = require('./parse/ParseCommon.js')
const ParseCode = require('./parse/ParseCode.js')

module.exports = {
  async syncAppFiles (folder) {
    const source = File.normalize(__dirname, '../dist/my-app')
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
    const content = ParseCode.getIndexHtml(html)
    File.writeToFile(file, content)
  },

  syncJsCode (data, lib) {
    this.syncLibs(data.folder, lib)
    this.syncJsApp(data.folder, data.htmlFiles, 'app', 'getJsAppModule')
    this.syncJsApp(data.folder, data.htmlFiles, 'app-routing', 'getJsAppRouter')
    this.syncJsComponents(data, lib)
    this.syncJsPages(data, lib)
  },

  syncLibs (folder, lib) {
    for (const file of ['DS', 'ExtendJS']) {
      const src = File.resolve(__dirname, 'template', file + '.js')
      const dest = File.resolve(folder, `_export/src/lib/${file}.js`)
      lib.fse.copySync(src, dest)
    }
  },

  syncJsApp (folder, htmlFiles, module, callback) {
    const jsFile = `app/${module}.module.ts`
    const file = File.resolve(folder, '_export/src', jsFile)
    const js = fs.existsSync(file) ? File.readFile(file) : Template.getTemplate(jsFile)
    File.writeToFile(file, ParseCode[callback](js, folder, htmlFiles))
  },

  syncJsComponents (data, lib) {
    for (const file of data.htmlFiles) {
      if (file.isComponent) {
        this.syncJsModule(data, file, lib)
        this.syncComponentStory(data, file)
      }
    }
  },

  syncJsPages (data, lib) {
    for (const file of data.htmlFiles) {
      if (!file.isComponent) {
        this.syncJsModule(data, file, lib)
      }
    }
  },

  syncJsModule (data, file, lib) {
    const clsPath = ParseCommon.getClassPath(file.path, data.folder)
    const destFile = File.resolve(data.folder, '_export/src/app', clsPath)
    const render = ParseCode.getClassCode(file, data, lib)
    this.syncJsModuleClass(destFile + '.ts', file, data, render)
    this.syncJsModuleTest(destFile + '.spec.ts', file, data.folder)
    File.writeToFile(destFile + '.html', render.html)
  },

  syncJsModuleClass (destFile, file, data, render) {
    let js = this.getJsModuleCode(destFile, '.ts', file, data.folder)
    js = ParseCode.parseJsModuleCode(destFile, file, data, render, js)
    File.writeToFile(destFile, js)
  },

  syncJsModuleTest (destFile, file, folder) {
    if (fs.existsSync(destFile)) return
    const js = this.getJsModuleCode(destFile, '.spec.ts', file, folder)
    File.writeToFile(destFile, js)
  },

  getJsModuleCode (destFile, ext, file, folder) {
    if (fs.existsSync(destFile)) return File.readFile(destFile)
    const template = Template.getTemplate('component/sample.component' + ext)
    return this.replaceTemplateContent(template, file.path, folder)
  },

  replaceTemplateContent (template, file, folder) {
    return template.replaceAll('CLASSNAME', ParseCommon.getClassName(file, folder))
      .replaceAll('SELECTOR', ParseCommon.getSelector(file, folder))
      .replaceAll('MODULE', ParseCommon.getModule(file))
  },

  syncComponentStory (data, file) {
    const clsName = ParseCommon.getClassName(file.path, data.folder)
    const storyFile = File.resolve(data.folder, `_export/src/stories/${clsName}.stories.js`)
    if (fs.existsSync(storyFile)) return
    const template = Template.getTemplate('Component.stories.js')
    const js = this.replaceTemplateContent(template, file.path, data.folder)
    File.writeToFile(storyFile, js)
  }
}
