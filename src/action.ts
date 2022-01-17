import * as core from '@actions/core'
import puppeteer from './puppeteer'
import server from './server'
import { findNPMCommands, findPackageJson } from './utils'
;(async () => {
  try {
    const { startPMServer, startStaticPMServer, stopPMServer } = server
    const { recordLocalServer } = puppeteer

    // General vars
    const env = process.argv[2] || 'dev'
    console.log('The process env: ', env)
    const ffmpegPath =
      env !== 'dev' ? core.getInput('ffmpeg-path') : '/usr/bin/ffmpeg'
    const chromePath =
      env !== 'dev'
        ? core.getInput('chrome-path')
        : '/usr/bin/google-chrome-stable'

    const projectDir = 'test'

    const hasPackageJson = findPackageJson(projectDir)

    if (hasPackageJson) {
      const { buildCMD, startCMD } = findNPMCommands(
        `${projectDir}/package.json`,
      )
      console.info('running commands')
      await startPMServer(buildCMD, startCMD)

      console.info('starting server')
      const sitemap = [
        '/home',
        '/afdelingen',
        '/over-ons',
        '/ons-team',
        '/shop',
        '/nieuws',
      ]
      await recordLocalServer(ffmpegPath, chromePath, sitemap)
    } else {
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
      await recordLocalServer(ffmpegPath, chromePath, sitemap, true)
    }
    console.info('stopping server')
    await stopPMServer()
  } catch (error: any) {
    console.log(error)

    core.setFailed(error)
  }
})()
