const Html = require('../Html.js')
const ExtendJS = require('../ExtendJS.js')
const ParseOverride = require('./ParseOverride.js')

module.exports = {
  // make sure to have very little regex code because of how complicated html parsing is
  regexHtmlRender (file, data, componentObj, document, lib) {
    let html = file.isComponent ? document.body.innerHTML : document.body.outerHTML
    html = ParseOverride.replaceOverrides(html, componentObj)
    // no global regex because we only need it once
    html = html.replace(/<body([\s\S]*?)<\/body>/, '<div$1</div>')
    html = this.addRegularProperties(html)
    html = this.addAllClasses(html, data, componentObj)
    html = this.addRootElementData(html)
    html = this.addComponentData(html, data)
    // right at the end, because we have tons of duplicates
    html = this.addTemplateNodes(html, componentObj)
    html = Html.beautifyHtml(html.replace(/\r?\n/g, '\n'), lib.beautify)
    return html + '\n'
  },

  // overridden properties have been removed from here
  // we can't add attributes with setAttributeNS because we allow invalid html/xml attributes
  addRegularProperties (html) {
    return html.replace(/data-ss-properties="(.*?)"/g, (match, json) => {
      const props = JSON.parse(json.replaceAll('&quot;', '"'))
      return this.getPropertyAttributes(props)
    })
  },

  getPropertyAttributes (props) {
    const attrs = []
    for (const [name, value] of Object.entries(props)) {
      this.addRegularProperty(name, value, attrs)
    }
    return attrs.join(' ')
  },

  addRegularProperty (name, value, attrs) {
    // don't allow class as the property because it messes with overrides
    if (name === 'class' || name === '[ngClass]') return
    if (value) {
      attrs.push(`${name}="${value.replaceAll('"', '&quot;')}"`)
    } else {
      attrs.push(name)
    }
  },

  // this process regular, overridden and root classes
  addAllClasses (html, data, componentObj) {
    return html.replace(/class="(.*?)"/g, (match, string) => {
      const classes = string.split(' ')
      const ref = Html.getRef(classes)
      const success = ParseOverride.overrideClasses(ref, classes,
        data.component.overrides[ref], componentObj.defaults)
      // we mutate the `classes` array to remove the regular records and add the coded ones
      return success ? this.buildClassesAttribute(classes) : match
    })
  },

  // [ngClass]="['e0ref', 'block', d.e0refClsRed]"
  buildClassesAttribute (classes) {
    for (let i = 0; i < classes.length; i++) {
      if (classes[i] !== 'd.componentRef' && !classes[i].startsWith('d.e0')) {
        classes[i] = "'" + classes[i] + "'"
      }
    }
    return `[ngClass]="[${classes.join(', ')}]"`
  },

  addRootElementData (html) {
    html = this.addRootElementClass(html)
    html = this.addRootElementVariants(html)
    return html
  },

  // this happens after we have added the class overrides
  // class="e0ref block" or [ngClass]="['e0ref', 'block', d.e0refClsRed]"
  addRootElementClass (html) {
    const regex = /(class|\[ngClass\])="(.*?desech-regex-root-class.*?)"/g
    return html.replace(regex, (match, cls, string) => {
      const array = this.extractClasses(string)
      for (let i = 0; i < array.length; i++) {
        if (array[i] === 'desech-regex-root-class') {
          array[i] = 'd.componentRef'
        }
      }
      return this.buildClassesAttribute(array)
    })
  },

  extractClasses (string) {
    if (string.startsWith('[')) {
      // [ngClass]="['e0ref', 'block', 'desech-regex-root-class', d.e0refClsRed]"
      const array = string.substring(1, string.length - 2).split(', ')
      for (let i = 0; i < array.length; i++) {
        if (array[i].startsWith("'")) {
          array[i] = array[i].substring(1, array[i].length - 2)
        }
      }
      return array
    } else {
      // class="e0ref block desech-regex-root-class"
      return string.split(' ')
    }
  },

  addRootElementVariants (html) {
    return html.replace(/desech-regex-root-variants=""/g, (match) => {
      // we want data-variant="" all the time because of how css works
      return '[attr.data-variant]="d.componentVariants"'
    })
  },

  addComponentData (html, data) {
    html = html.replace(/desech-regex-component-ref="(e0[a-z0-9]+)"/g, (match, ref) => {
      return `d-ref="${ref}"`
    })
    html = html.replace(/desech-regex-component-overrides-(e0[a-z0-9]+)=""/g, (match, ref) => {
      return '[d-overrides]="d.' + ref + 'Overrides"'
    })
    html = this.addComponentVariants(html, data.component.variants)
    return html
  },

  addComponentVariants (html, variants) {
    const regex = /desech-regex-component-variants-(e0[a-z0-9]+)="(.*?)"/g
    return html.replace(regex, (match, ref, file) => {
      return this.buildVariants(ref, variants[file])
    })
  },

  buildVariants (ref, variants) {
    if (!variants) return ''
    const list = []
    for (const name of variants) {
      const varName = `[d-var-${ExtendJS.toKebab(name)}]`
      const varVal = `d.${ref}Var${ExtendJS.toPascalCase(name)}`
      const attr = `${varName}="${varVal}"`
      list.push(attr)
    }
    return list.join(' ')
  },

  /**
   * Convert <foo></foo> to:
   * <ng-template #foo>
   *   <foo></foo>
   * </ng-template>
   * <ng-template #bar>
   *   <bar></bar>
   * </ng-template>
   * <ng-container *ngTemplateOutlet="this[this.e0RefComponent]"></ng-container>
   */
  addTemplateNodes (html, componentObj) {
    const regex = /<desech-regex-override-(tag|component)-(e0[a-z0-9]+)([\s\S]*?)<\/desech-regex-override-(tag|component)-e0[a-z0-9]+>/g
    return html.replace(regex, (match, type, ref, inner) => {
      const list = []
      this.addNgTemplates(list, componentObj.templates[ref], inner)
      this.addNgContainer(list, type, ref)
      return list.join('\n')
    })
  },

  addNgTemplates (list, templates, inner) {
    for (const val of templates) {
      list.push(`<ng-template #${val.template}>
        <${val.name}${inner}</${val.name}>
      </ng-template>`)
    }
  },

  addNgContainer (list, type, ref) {
    const index = ref + ExtendJS.capitalize(type)
    list.push(`<ng-container *ngTemplateOutlet="this[this.d.${index}]"></ng-container>`)
  }
}
