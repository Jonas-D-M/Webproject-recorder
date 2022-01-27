import * as core from '@actions/core'
import { promisify } from 'util'
import octokit from './octokit'
const exec = promisify(require('child_process').exec)
import puppeteer from './puppeteer'
import server from './server'
import timer from './timer'
import { findNPMCommands, findPackageJson } from './utils'

export default (async () => {
  const { startPMServer, startStaticPMServer, stopPMServer } = server
  const { recordLocalServer, getAllPages } = puppeteer
  const { startTimer, stopTimer, getDuration } = timer
  const { initOctokit, createCommit } = octokit
  try {
    await exec('npm install pm2 -g')
    await exec('pm2 install typescript')
    await exec('sudo apt install ffmpeg')
    // get chrome path
    const { stdout } = await exec('which google-chrome-stable')

    const chromePath = stdout.trim()
    const token = core.getInput('token')
    const dir = core.getInput('project-dir')
    const octokit = initOctokit(token)

    const projectDir = dir

    console.info('Projectdir: ', projectDir)
    console.info('token: ', token)
    console.info('chromepath: ', chromePath)

    core.startGroup('Searching package.json...')
    const hasPackageJson = findPackageJson(projectDir)
    core.endGroup()

    if (hasPackageJson) {
      startTimer()
      core.startGroup('Starting local server...')
      const { buildCMD, startCMD } = findNPMCommands(
        `${projectDir}/package.json`,
      )
      console.info('running commands')
      await startPMServer(buildCMD, startCMD)

      core.endGroup()

      console.info('starting server')
      const sitemap = await getAllPages(false, chromePath)
      console.log(sitemap)

      core.startGroup('Creating recording...')
      await recordLocalServer(chromePath, sitemap, false)
      core.endGroup()
    } else {
      startTimer()
      core.notice('No package.json found, handling it as a regular HTML site')
      core.startGroup('Creating local server...')

      console.info('starting static server')
      await startStaticPMServer(projectDir)
      const sitemap = await getAllPages(true, chromePath)
      core.endGroup()
      core.startGroup('Creating recording...')
      await recordLocalServer(chromePath, sitemap, true)
      core.endGroup()
    }
    console.info('stopping server')
    await stopPMServer()
    core.endGroup()
    stopTimer()
    console.log(`duration: ${getDuration()}s`)

    await createCommit(octokit)

    process.exit(0)
  } catch (error: any) {
    console.log('threw an error: ', error)
    await stopPMServer()
    core.setFailed(error)
    process.exit(1)
  }
})()
