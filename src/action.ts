import * as core from '@actions/core'
import { promisify } from 'util'
const exec = promisify(require('child_process').exec)
import puppeteer from './puppeteer'
import server from './server'
import { findNPMCommands, findPackageJson } from './utils'
;(async () => {
  const { startPMServer, startStaticPMServer, stopPMServer } = server
  const { recordLocalServer } = puppeteer
  try {
    // get chrome path
    const { stdout } = await exec('which google-chrome-stable')

    await exec('npm install pm2 -g')
    await exec('pm2 install typescript')
    await exec('apt install ffmpeg')

    // General vars
    const chromePath = stdout.trim()
    const projectDir = core.getInput('project-dir') ?? '.'

    core.startGroup('Searching package.json...')
    const hasPackageJson = findPackageJson(projectDir)
    core.endGroup()

    if (hasPackageJson) {
      core.startGroup('Starting local server...')
      const { buildCMD, startCMD } = findNPMCommands(
        `${projectDir}/package.json`,
      )
      console.info('running commands')
      await startPMServer(buildCMD, startCMD)

      core.endGroup()

      console.info('starting server')
      const sitemap = [
        '/home',
        '/afdelingen',
        '/over-ons',
        '/ons-team',
        '/shop',
        '/nieuws',
      ]
      core.startGroup('Creating recording...')
      await recordLocalServer(chromePath, sitemap)
      core.endGroup()
    } else {
      core.notice('No package.json found, handling it as a regular HTML site')
      core.startGroup('Creating local server...')
      const sitemap = [
        '/index',
        '/vrijdag',
        '/zaterdag',
        '/info',
        '/reglement',
        '/sponsors',
        '/inschrijvingen',
        '/contact',
      ]
      console.info('starting static server')
      await startStaticPMServer()
      core.endGroup()
      core.startGroup('Creating recording...')
      await recordLocalServer(chromePath, sitemap, true)
      core.endGroup()
    }
    console.info('stopping server')
    await stopPMServer()
    core.endGroup()
    process.exit(0)
  } catch (error: any) {
    console.log('threw an error: ', error)
    await stopPMServer()
    core.setFailed(error)
    process.exit(1)
  }
})()
