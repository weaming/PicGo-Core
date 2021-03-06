import PicGo from '../core/PicGo'
import match from 'minimatch'
import { Options } from './interfaces'
import fs from 'fs-extra'
import path from 'path'
import globby from 'globby'
import ejs from 'ejs'

/**
 * Generate template files to destination files.
 * @param {PicGo} ctx
 * @param {Options} options
 */
const generate = async (ctx: PicGo, options: Options): Promise<any> => {
  try {
    const opts = getOptions(options.tmp)
    const source = path.join(options.tmp, 'template')
    let answers = {}
    if (opts.prompts && opts.prompts.length > 0) {
      answers = await ctx.cmd.inquirer.prompt(opts.prompts)
    }
    let _files: Array<string> = await globby(['**/*'], { cwd: source, dot: true }) // get files' name array
    _files = _files.filter((item: string) => {
      let glob = ''
      Object.keys(opts.filters).forEach((key: string) => {
        if (match(item, key, { dot: true })) {
          glob = item
        }
      })
      if (glob) { // find a filter expression
        return filters(ctx, opts.filters[glob], answers)
      } else {
        return true
      }
    })
    if (_files.length === 0) {
      return ctx.log.warn('Template files not found!')
    }
    let files = render(_files, source, answers)
    writeFileTree(options.dest, files)
    if (typeof opts.complete === 'function') {
      opts.complete({ answers, options, files: _files, ctx })
    }
    if (opts.completeMessage) {
      ctx.log.success(opts.completeMessage)
    }
    ctx.log.success('Done!')
  } catch (e) {
    return ctx.log.error(e)
  }
}

/**
 * Return the filters' result
 * @param ctx PicGo
 * @param exp condition expression
 * @param data options data
 */
const filters = (ctx: PicGo, exp: any, data: any): boolean => {
  const fn = new Function('data', 'with (data) { return ' + exp + '}')
  try {
    return fn(data)
  } catch (e) {
    ctx.log.error('Error when evaluating filter condition: ' + exp)
  }
}

/**
 * Get template options
 * @param {string} templatePath
 */
const getOptions = (templatePath: string): any => {
  let optionsPath = path.join(templatePath, 'index.js')
  if (fs.existsSync(optionsPath)) {
    const options = require(optionsPath)
    return options
  } else {
    return {}
  }
}

/**
 * Render files to a virtual tree object
 * @param {arry} files
 */
const render = (files: Array<string>, source: string, options: any): any => {
  let fileTree = {}
  files.forEach((filePath: string): void => {
    const file = fs.readFileSync(path.join(source, filePath), 'utf8')
    const content = ejs.render(file, options)
    if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
      fileTree[filePath] = content
    }
  })
  return fileTree
}

/**
 * Write rendered files' content to real file
 * @param {string} dir
 * @param {object} files
 */
const writeFileTree = (dir: string, files: any): void => {
  Object.keys(files).forEach((name: string) => {
    const filePath = path.join(dir, name)
    fs.ensureDirSync(path.dirname(filePath))
    fs.writeFileSync(filePath, files[name])
  })
}

export {
  filters,
  generate,
  render,
  writeFileTree
}
