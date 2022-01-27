const ExtendJS = require('../ExtendJS.js')
const File = require('../File.js')

module.exports = {
  // /path/user/register.html => page/user/register/register.component
  // /path/component/header/nav.html => component/header/nav/nav.component
  // component/header/nav.html => component/header/nav/nav.component
  getClassPath (file, folder = '') {
    const relPath = this.getRelPath(file, folder)
    const jsPath = relPath.startsWith('component/') ? relPath : 'page/' + relPath
    const name = File.basename(jsPath, '.html') + '.component'
    return File.resolve(jsPath.replace('.html', ''), name)
  },

  // /path/user/register.html => UserRegister
  // /path/component/header/nav.html => HeaderNav
  // component/header/nav.html => HeaderNav
  getClassName (file, folder = '') {
    const relPath = this.getRelPath(file, folder)
    const filePath = relPath.replace('component/', '').replace('.html', '')
    return ExtendJS.toPascalCase(filePath)
  },

  // /path/user/register.html => register
  // /path/component/header/nav.html => nav
  // component/header/nav.html => nav
  getModule (file) {
    return File.basename(file, '.html')
  },

  // /path/user/register.html => user-register
  // /path/component/header/nav.html => header-nav
  // component/header/nav.html => header-nav
  getSelector (file, folder = '') {
    const relPath = this.getRelPath(file, folder)
    const filePath = relPath.replace('component/', '').replace('.html', '')
    return filePath.replaceAll('/', '-')
  },

  // /path/component/header/nav.html => cmp-header-nav
  getCssClass (file, folder = '') {
    return 'cmp-' + this.getSelector(file, folder)
  },

  getRelPath (file, folder) {
    return folder ? file.replace(folder + '/', '') : file
  },

  getComponentData (node) {
    const data = node.getAttributeNS(null, 'data-ss-component')
    const json = data ? JSON.parse(data) : null
    return json
  },

  getProperties (node) {
    const string = node.getAttributeNS(null, 'data-ss-properties')
    return string ? JSON.parse(string) : {}
  },

  setProperties (node, properties) {
    if (ExtendJS.isEmpty(properties)) {
      node.removeAttributeNS(null, 'data-ss-properties')
    } else {
      node.setAttributeNS(null, 'data-ss-properties', JSON.stringify(properties))
    }
  }
}
