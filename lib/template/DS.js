import ExtendJS from './ExtendJS.js'

export default {
  getDesechData (props, component) {
    const data = {}
    const variantsKeyVal = this.getVariantsKeyVal(props)
    this.setRootElement(props, variantsKeyVal, data)
    this.setDefaults(component?.defaults, data)
    this.setVariantOverrides(variantsKeyVal, component?.variants, data)
    this.setOverrides(props['d-overrides'], data)
    return data
  },

  getVariantsKeyVal (props) {
    const list = {}
    for (const [name, value] of Object.entries(props)) {
      if (name.startsWith('d-var-')) {
        list[name.substring('d-var-'.length)] = value
      }
    }
    return ExtendJS.isEmpty(list) ? null : list
  },

  setRootElement (props, variantsKeyVal, data) {
    if (props['d-ref']) data.componentRef = props['d-ref']
    // we always need data-variant="" otherwise css overrides won't work
    data.componentVariants = this.buildDataVariant(variantsKeyVal)
  },

  buildDataVariant (variants) {
    // data-variant="foo-var=bar-val foo2=bar2 foo3=bar3"
    // if the value is empty, it will skip the variant
    // if no variants are set or the component has no variants, then it will show an empty space
    if (!variants) return ' '
    const list = []
    for (const [name, val] of Object.entries(variants)) {
      if (val) list.push(`${name}=${val}`)
    }
    return list.length ? list.join(' ') : ' '
  },

  // here we have the overrides for the children components
  setDefaults (defaults, data) {
    if (!defaults) return
    for (const [ref, object] of Object.entries(defaults)) {
      for (const [name, value] of Object.entries(object)) {
        this.setValue(data, ref, name, value)
      }
    }
  },

  setVariantOverrides (variantsKeyVal, variantOverrides, data) {
    if (!variantsKeyVal) return
    for (const [varName, varVal] of Object.entries(variantsKeyVal)) {
      if (variantOverrides[varName] && variantOverrides[varName][varVal]) {
        this.setOverrides(variantOverrides[varName][varVal], data)
      }
    }
  },

  // here we have the overrides for the component elements, coming from the parent
  setOverrides (overrides, data) {
    if (!overrides) return
    for (const [ref, obj] of Object.entries(overrides)) {
      for (const [name, value] of Object.entries(obj)) {
        this.setValue(data, ref, name, value)
      }
    }
  },

  setValue (data, ref, name, value) {
    switch (name) {
      case 'tag': case 'component':
        data[ref + ExtendJS.toPascalCase(name)] = ref + 'Tpl' + ExtendJS.toPascalCase(value)
        break;
      case 'inner':
        // with `inner` if this value contains code like `{{user}}` it will not be parsed as code
        // @todo maybe improve this in the future
        data[ref + ExtendJS.toPascalCase(name)] = value
        break
      case 'attributes':
        this.setUnrenderValue(data, ref, value)
        this.setAttributesValue(data, ref, value)
        break
      case 'properties':
        this.setAttributesValue(data, ref, value)
        break
      case 'classes':
        this.setClassesValue(data, ref, value)
        break
      case 'children': case 'overrides':
        this.setOverridesValue(data, ref, value)
        break
      case 'variants':
        this.setVariantsValue(data, ref, value)
        break
      default:
    }
  },

  // although the `defaults` object has the `unrender` property, the overrides stores it inside
  // the attributes object as `data-ss-unrender`
  setUnrenderValue (data, ref, attributes) {
    if (!attributes['data-ss-unrender']) return
    data[ref + 'Unrender'] = ('value' in attributes['data-ss-unrender'])
    delete attributes['data-ss-unrender']
  },

  setAttributesValue (data, ref, attributes) {
    for (const [name, obj] of Object.entries(attributes)) {
      const index = ref + 'Attr' + ExtendJS.toPascalCase(name)
      // if this value contains code like `{{user}}` it will not be parsed as code
      // @todo maybe improve this in the future
      data[index] = obj.delete ? null : obj.value
    }
  },

  setClassesValue (data, ref, classes) {
    for (const [name, obj] of Object.entries(classes)) {
      const index = ref + 'Cls' + ExtendJS.toPascalCase(name)
      data[index] = obj.delete ? '' : name
    }
  },

  setOverridesValue (data, ref, overrides) {
    if (!data[ref + 'Overrides']) {
      data[ref + 'Overrides'] = overrides
    } else {
      this.mergeObjects(data[ref + 'Overrides'], overrides)
    }
  },

  // obj1 is mutated; obj2 is placed on top of obj1
  mergeObjects (obj1, obj2) {
    ExtendJS.mergeDeep(obj1, obj2)
    this.mergeObjectsFix(obj1)
  },

  // mergeDeep will merge everything including the attribute/property/class values
  // if we have these pairs value/delete or add/delete, remove the first value
  mergeObjectsFix (obj) {
    if (ExtendJS.isEmpty(obj)) return
    if (Object.keys(obj).length === 2 && (('value' in obj && 'delete' in obj) ||
      ('add' in obj && 'delete' in obj))) {
      delete obj[Object.keys(obj)[0]]
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        this.mergeObjectsFix(obj[key])
      }
    }
  },

  setVariantsValue (data, ref, variantsKeyVal) {
    for (const [name, value] of Object.entries(variantsKeyVal)) {
      data[ref + 'Var' + ExtendJS.toPascalCase(name)] = value
    }
  }
}
