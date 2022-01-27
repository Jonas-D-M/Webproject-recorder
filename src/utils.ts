import { join } from 'path'
import { readdirSync, lstatSync, existsSync, readFileSync } from 'fs'

export const searchDirRecursive = (
  startPath: string,
  filter: RegExp,
  callback: (filename: string) => void,
) => {
  if (!existsSync(startPath)) {
    console.log('no dir ', startPath)
    return
  }

  const files = readdirSync(startPath)

  for (var i = 0; i < files.length; i++) {
    let filename = join(startPath, files[i])
    let stat = lstatSync(filename)
    if (stat.isDirectory()) {
      searchDirRecursive(filename, filter, callback) //recurse
    } else if (filter.test(filename)) callback(filename)
  }
}

export const searchDir = (
  startPath: string,
  filter: RegExp,
  callback: (filename: string) => void,
) => {
  if (!existsSync(startPath)) {
    console.log('no dir ', startPath)
    return
  }

  const files = readdirSync(startPath)

  for (var i = 0; i < files.length; i++) {
    let filename = join(startPath, files[i])
    if (filter.test(filename)) callback(filename)
  }
}

export const findNPMCommands = (path: string) => {
  try {
    const data = readFileSync(path, { encoding: 'utf-8', flag: 'r' })
    const packagejson = JSON.parse(data)

    const buildCMD = packagejson['scripts'].build
    const startCMD = packagejson['scripts'].start

    return { buildCMD, startCMD }
  } catch (error) {
    throw error
  }
}

export const findPackageJson = (path: string) => {
  try {
    readFileSync(`${path}/package.json`, { encoding: 'utf-8', flag: 'r' })
    return true
  } catch (error) {
    return false
  }
}

export const retry = (fn: any, ms: number) =>
  new Promise(resolve => {
    fn()
      .then(resolve)
      .catch((e: any) => {
        console.log(e)

        setTimeout(() => {
          console.log('retrying...')
          retry(fn, ms).then(resolve)
        }, ms)
      })
  })
