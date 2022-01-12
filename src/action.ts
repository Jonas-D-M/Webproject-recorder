import core from '@actions/core'
// const github = require("@actions/github");
import fs from 'fs'
import path from 'path'
import server from './server'
// const readmeBox = require("readme-box").ReadmeBox;
// const chunk = require("chunk");
const { initServer, test } = server

;(async () => {
  try {
    fs.readdir('.', (err, files) => {
      files.forEach(file => {
        console.log(file)
      })
    })

    async function run() {
      console.log('Hello world!')
    }

    initServer()
    test()

    run()
  } catch (error: any) {
    core.setFailed(error.message)
  }
})()
