import * as core from '@actions/core'
import puppeteer from './puppeteer'
import server from './server'
import { findNPMCommands, findPackageJson } from './utils'
import firebase from './firebase'
import pm2 from 'pm2'
import { config } from 'dotenv'
;(async () => {
  config()
  const { startPMServer, startStaticPMServer, stopPMServer } = server
  const { recordLocalServer } = puppeteer
  const { uploadFileToFirebase } = firebase
  try {
    // General vars
    const env = process.argv[2] || 'dev'
    console.log('The process env: ', env)
    const ffmpegPath =
      env !== 'dev' ? core.getInput('ffmpeg-path') : '/usr/bin/ffmpeg'
    const chromePath =
      env !== 'dev'
        ? core.getInput('chrome-path')
        : '/usr/bin/google-chrome-stable'

    const projectDir = core.getInput('project-dir')

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
      pm2.connect(function (err) {
        if (err) {
          process.exit(2)
        }
        pm2.list((err, list) => {
          console.log(err, list)
          pm2.disconnect()
        })
      })

      core.endGroup()
      core.startGroup('Creating recording...')
      await recordLocalServer(ffmpegPath, chromePath, sitemap, true)
      core.endGroup()
    }
    console.info('stopping server')
    await stopPMServer()
    core.startGroup('Uploading video to firebase...')
    const serviceAccount = JSON.parse(require('../service-account.json'))
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
    console.log('threw an error: ', error)
    await stopPMServer()
    core.setFailed(error)
  }
})()
