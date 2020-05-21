/**
 * Rem 布局初始化
 *
 * @packageDocumentation
 */

/**
 * rem 布局配置项
 * @public
 */
export interface RemLayoutOptions {
  /**
   * 当屏幕逻辑像素宽度与设计稿相同时的 HTML 字体大小
   * 默认是 30
   */
  baseFontSize?: number

  /**
   * 设计稿逻辑像素宽度
   * 默认是 750
   */
  baseWidth?: number

  /**
   * 当 `window.document.documentElement.clientWidth` 和 `window.innerWidth` 都不存在时窗口的默认逻辑像素宽度。
   * 默认值是 375。
   */
  defaultWidth?: number

  /**
   * 最大支持逻辑像素宽度。
   * 如果设置为 0 则不限制。
   * 默认值是 750。
   */
  maxWidth?: number
}

abstract class Validator {
  public constructor (public key: string, public type: string) {}

  public abstract validate (value: any): boolean // pure virtual

  public gerErrorMessage (typeGot: string): string { // virtual
    return `The option "${this.key}" expect type: "${this.type}", but got "${typeGot}"`
  }
}

class NumberValidator extends Validator {
  public constructor (key: string) {
    super(key, 'number')
  }

  public validate (value: any): boolean { // override
    return typeof value === 'number'
  }
}

class OptionDescriptor {
  public defaultValue: any
  public name: string
  public validator: Validator
  public value: any

  public constructor (validator: Validator, defaultValue: any) {
    this.defaultValue = defaultValue
    this.name = validator.key
    this.validator = validator
    this.value = defaultValue
  }
}

class OptionProvider {
  public definedOptions: { [name: string]: OptionDescriptor } = {}

  public defineOption (descriptor: OptionDescriptor): OptionProvider {
    this.definedOptions[descriptor.name] = descriptor
    return this
  }

  public assertOption (key: string): void {
    if (!Object.prototype.hasOwnProperty.call(this.definedOptions, key)) {
      throw new Error('Unsupported option: "' + key + '"')
    }
  }

  public getOption (key: string): OptionDescriptor {
    this.assertOption(key)
    return this.definedOptions[key]
  }

  public getValue (key: string): any {
    return this.getOption(key).value
  }

  public getDefaultValue (key: string): any {
    return this.getOption(key).defaultValue
  }

  public setValue (key: string, value: any): void {
    const desc = this.getOption(key)
    const validator = desc.validator
    if (validator.validate(value)) {
      desc.value = value
    } else {
      throw new TypeError(validator.gerErrorMessage(typeof value))
    }
  }
}

const optionProvider = new OptionProvider()
optionProvider
  .defineOption(new OptionDescriptor(new NumberValidator('baseFontSize'), 30))
  .defineOption(new OptionDescriptor(new NumberValidator('baseWidth'), 750))
  .defineOption(new OptionDescriptor(new NumberValidator('defaultWidth'), 375))
  .defineOption(new OptionDescriptor(new NumberValidator('maxWidth'), 750))
  // .defineOption(new OptionDescriptor(new NumberValidator('ratio'), 25))

const eventName = 'resize'

let enabled = false

function resetHTMLFontSize (): void {
  let currentWidth = window.document.documentElement.clientWidth ?? window.innerWidth ?? optionProvider.getValue('defaultWidth')
  const maxWidth = optionProvider.getValue('maxWidth')
  if (maxWidth !== 0) {
    if (currentWidth > maxWidth) {
      currentWidth = maxWidth
    }
  }
  const baseFontSize = optionProvider.getValue('baseFontSize')
  const baseWidth = optionProvider.getValue('baseWidth')
  const ratio = baseWidth / baseFontSize
  window.document.documentElement.style.fontSize = (currentWidth / ratio).toString() + 'px'
}

var handler = resetHTMLFontSize

/**
 * 获取当前配置
 * @public
 * @returns 配置项
 */
export function getOption (): Required<RemLayoutOptions> {
  const options: any = {}
  for (const k in optionProvider.definedOptions) {
    if (Object.prototype.hasOwnProperty.call(optionProvider.definedOptions, k)) {
      options[k] = optionProvider.definedOptions[k].value
    }
  }
  return options as Required<RemLayoutOptions>
}

/**
 * 修改配置项
 * @param options - 配置项
 * @public
 */
function changeOption (options: RemLayoutOptions): void

/**
 * 修改配置项
 * @param key - 配置项键名
 * @param value - 配置项值
 * @public
 */
function changeOption (key: keyof RemLayoutOptions, value: any): void

function changeOption (key: any, value?: any): void {
  if (typeof key === 'string') {
    if (value === undefined) {
      throw new Error('Missing the second argument of changeOption().')
    }
    const obj: RemLayoutOptions = {}
    obj[key as keyof RemLayoutOptions] = value
    changeOption(obj)
  } else if (typeof key === 'object' && key !== null) {
    const backup: any = {}
    for (const x in optionProvider.definedOptions) {
      if (Object.prototype.hasOwnProperty.call(optionProvider.definedOptions, x)) {
        backup[x] = optionProvider.definedOptions[x].value
      }
    }
    try {
      for (const k in key) {
        if (Object.prototype.hasOwnProperty.call(key, k)) {
          optionProvider.setValue(k, key[k])
        }
      }
    } catch (err) {
      for (const o in backup) {
        if (Object.prototype.hasOwnProperty.call(backup, o)) {
          optionProvider.setValue(o, backup[o])
        }
      }
      throw err
    }
    try {
      resetHTMLFontSize()
    } catch (_) {}
  } else {
    throw new TypeError('The first argument of changeOption() must be a string or an object.')
  }
}

export { changeOption }

/**
 * 启用 rem 布局。
 * 如果已经启用，再次调用此函数则会调用 {@link (changeOption:1) | changeOption(options: RemLayoutOptions)}
 * @param options - rem 布局配置项
 * @public
 */
export function enable (options: RemLayoutOptions = {}): void {
  if (enabled) {
    changeOption(options)
    return
  }

  for (const k in optionProvider.definedOptions) {
    const key = k as keyof RemLayoutOptions
    if (Object.prototype.hasOwnProperty.call(optionProvider.definedOptions, key)) {
      optionProvider.setValue(key, (key in options && Object.prototype.hasOwnProperty.call(options, key)) ? options[key] : optionProvider.getDefaultValue(key))
    }
  }
  if (typeof window.document.addEventListener !== 'function') {
    (window as any).attachEvent('onresize', handler);
    (window as any).attachEvent('onload', handler)
  } else {
    window.addEventListener(eventName, handler, false)
    window.document.addEventListener('DOMContentLoaded', handler, false)
  }
  enabled = true
  try {
    resetHTMLFontSize()
  } catch (_) {}
}

/**
 * 禁用 rem 布局
 * @public
 */
export function disable (): void {
  if (enabled) {
    if (typeof window.document.addEventListener !== 'function') {
      (window as any).detachEvent('onresize', handler);
      (window as any).detachEvent('onload', handler)
    } else {
      window.removeEventListener(eventName, handler, false)
      window.document.removeEventListener('DOMContentLoaded', handler, false)
    }
    window.document.documentElement.style.fontSize = ''
    enabled = false
  }
}
