import { join } from 'path'
import { readdirSync, lstatSync, existsSync, readFileSync } from 'fs'
import { promisify } from 'util'
const io = require('@actions/io')
const exec = promisify(require('child_process').exec)

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

export const findComponentsJson = (path: string) => {
  try {
    readFileSync(`${path}/components.json`, { encoding: 'utf-8', flag: 'r' })
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

export const pushChanges = async () => {
  await exec("git config --global user.name 'Workflow-Builder'")
  await exec(
    "git config --global user.email 'your-username@users.noreply.github.com'",
  )
  await exec('git add .')
  await exec(
    "git commit -am 'Generated showcase video' || echo 'No changes to commit'",
  )
  await exec('git push')
}

export const installDependencies = async () => {
  // await exec('npm install pm2 -g')
  // await exec('sudo pm2 update')
  // await exec('pm2 install typescript')
  await exec('sudo apt-get install ffmpeg')
}

export const getChromePath = () => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const { stdout } = await exec('which google-chrome-stable')
      resolve(stdout.trim())
    } catch (error) {
      reject(error)
    }
  })
}

export const createShowcaseDirectories = (projectDir: string) => {
  return new Promise<void>(async resolve => {
    await io.mkdirP(`${projectDir}/showcase/video`)
    await io.mkdirP(`${projectDir}/showcase/screenshots`)
    resolve()
  })
}
