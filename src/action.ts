import * as core from '@actions/core'
import puppeteer from './puppeteer'
import server from './server'
import { findNPMCommands, findPackageJson } from './utils'
import firebase from './firebase'
import { config } from 'dotenv'
;(async () => {
  try {
    config()
    const { startPMServer, startStaticPMServer, stopPMServer } = server
    const { recordLocalServer } = puppeteer
    const { uploadFileToFirebase } = firebase

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
      await recordLocalServer(ffmpegPath, chromePath, sitemap)
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
      await recordLocalServer(ffmpegPath, chromePath, sitemap, true)
      core.endGroup()
    }
    console.info('stopping server')
    await stopPMServer()
    core.startGroup('Uploading video to firebase...')
    const serviceAccount = require('../service-account.json')
    const bucket = process.env.BUCKET || ''

    const url = await uploadFileToFirebase(
      serviceAccount,
      bucket,
      './video/showcase-video.mp4',
      'showcase-video',
    )
    console.log(url)
    core.endGroup()
  } catch (error: any) {
    console.log(error)

    core.setFailed(error)
  }
})()
