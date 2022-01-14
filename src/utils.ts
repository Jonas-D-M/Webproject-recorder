import { join } from 'path'
import { readdirSync, lstatSync, existsSync, readFile, readFileSync } from 'fs'

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
    console.log(packagejson)

    const buildCMD = packagejson['scripts'].build
    const startCMD = packagejson['scripts'].start
    return { buildCMD, startCMD }
  } catch (error) {
    throw error
  }
}
