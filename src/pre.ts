import { promisify } from 'util'

const exec = promisify(require('child_process').exec)

export default (async () => {
  await exec('npm install pm2 -g')
  await exec('pm2 install typescript')
  await exec('sudo apt install ffmpeg')
})()
