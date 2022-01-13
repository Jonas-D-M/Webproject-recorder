import core from '@actions/core'
// const github = require("@actions/github");
import fs from 'fs'
import path from 'path'
import puppeteerServer from './puppeteer'
import selenium from './selenium'
import server from './server'
// const readmeBox = require("readme-box").ReadmeBox;
// const chunk = require("chunk");
const { startServer, stopServer, test } = server
// const { example } = selenium
const { example } = puppeteerServer

;(async () => {
  try {
    example()
  } catch (error: any) {
    console.log(error)

    core.setFailed(error.message)
  }
})()
