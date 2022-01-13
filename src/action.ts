import core from '@actions/core'
// const github = require("@actions/github");
import fs from 'fs'
import path from 'path'
import puppeteer from './puppeteer'
import server from './server'
const { startServer, stopServer, test } = server
const { example } = puppeteer

;(async () => {
  try {
    example()
  } catch (error: any) {
    console.log(error)

    core.setFailed(error.message)
  }
})()
