import * as core from '@actions/core'
import { series } from 'async'
import { exec } from 'child_process'
import puppeteer from './puppeteer'
import server from './server'
import {
  findNPMCommands,
  findPackageJson,
  runCommands,
  stopPMServer,
} from './utils'
import { searchDir } from './utils'
;(async () => {
  try {
    const { startServer, stopServer, test } = server
    const { example, recordLocalServer } = puppeteer

    // General vars
    const env = process.argv[2] || 'dev'
    console.log('The process env: ', env)
    const ffmpegPath =
      env !== 'dev' ? core.getInput('ffmpeg-path') : '/usr/bin/ffmpeg'
    const chromePath =
      env !== 'dev'
        ? core.getInput('chrome-path')
        : '/usr/bin/google-chrome-stable'

    const projectDir = 'test2'

    const hasPackageJson = findPackageJson(projectDir)

    if (hasPackageJson) {
      const { buildCMD, startCMD } = findNPMCommands(
        `${projectDir}/package.json`,
      )
      // console.log(buildCMD, startCMD)

      // series([
      //   () => exec(`cd test2 && npm run ${buildCMD}`),
      //   // () => exec(`npm run ${startCMD}`),
      // ])
      console.log('running commands')
      await runCommands(buildCMD, startCMD)
      console.log('starting server')
      await recordLocalServer(ffmpegPath, chromePath)
      console.log('stopping server')

      await stopPMServer()
    } else {
      startServer(3000, '/test')
      await recordLocalServer(ffmpegPath, chromePath)
      stopServer()
    }
  } catch (error: any) {
    console.log(error)

    core.setFailed(error)
  }
})()
