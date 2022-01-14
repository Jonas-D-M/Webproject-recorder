import * as core from '@actions/core'
// const github = require("@actions/github");
// import { series } from 'async'
// import { exec } from 'child_process'
import puppeteer from './puppeteer'
// import server from './server'
// import { findNPMCommands } from './utils'
import { searchDir } from './utils'
;(async () => {
  try {
    // const { startServer, stopServer, test } = server
    const { example } = puppeteer

    const ffmpegPath = core.getInput('ffmpeg-path')
    // console.log('input: ', ffmpegPath)

    example(ffmpegPath)
    // example('/usr/bin/ffmpeg')
    searchDir('./tmp', /\test.mp4$/, function (filename) {
      console.log('-- found: ', filename)
    })
    // searchDir('./test', /\index.html$/, function (filename) {
    //   console.log('-- found: ', filename)
    // })
    // const { buildCMD, startCMD } = findNPMCommands('package.json')

    // series([() => exec(buildCMD), () => exec(startCMD)])
  } catch (error: any) {
    console.log(error)

    core.setFailed(error)
  }
})()
