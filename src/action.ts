import * as core from '@actions/core'
import path from 'path/posix'
import { promisify } from 'util'
const exec = promisify(require('child_process').exec)
import puppeteer from './puppeteer'
import server from './server'
import timer from './timer'
import {
  createShowcaseDirectories,
  findComponentsJson,
  findPackageJson,
  getChromePath,
  installDependencies,
  pushChanges,
} from './utils'

export default (async () => {
  const { screenshotComponents, addScreenshotsToReadme, createRecording } =
    puppeteer
  const { startServer, stopServer } = server

  const { startTimer, stopTimer, getDuration } = timer
  try {
    // await installDependencies()

    // get chrome path
    const chromePath = await getChromePath()
    // const projectDir = path.relative(
    //   __dirname.replace('/dist', '').replace('/src', ''),
    //   process.cwd(),
    // )
    const projectDir = __dirname.replace('/src', '/test')

    core.startGroup('Searching package.json...')
    const isStatic = !findPackageJson(projectDir)
    const wantsScreenshots = findComponentsJson(projectDir)
    core.endGroup()

    console.log({ isStatic, wantsScreenshots })

    await startServer(isStatic, projectDir)
    await createShowcaseDirectories(projectDir)
    startTimer()

    // await createRecording(isStatic, projectDir, chromePath)

    if (wantsScreenshots) {
      await screenshotComponents(chromePath, isStatic, projectDir)
      await addScreenshotsToReadme(projectDir)
    }
    stopTimer()
    console.log(`duration: ${getDuration()}s`)

    // core.startGroup('Push changes to repo')
    // await pushChanges()
    // core.endGroup()

    await stopServer(isStatic)
    process.exit(0)
  } catch (error: any) {
    console.log('threw an error: ', error)
    core.setFailed(error)
    process.exit(1)
  }
})()
