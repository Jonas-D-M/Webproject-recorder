import puppeteer, { Page } from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'

export default (() => {
  const browserConfig = {
    headless: false,
    ignoreHTTPSErrors: true,

    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--start-maximized',
      '--disable-dev-shm-usage',
      '--headless',
    ],
  }
  const recordConfig = {
    followNewTab: true,
    fps: 25,
    ffmpeg_Path: '/usr/bin/ffmpeg',
    videoFrame: {
      width: 1920,
      height: 1080,
    },
    aspectRatio: '16:9',
  }
  let processId: number | undefined

  const example = async () => {
    const browser = await puppeteer
      .launch(browserConfig)
      .then(async browser => {
        processId = browser.process()?.pid
        return browser
      })
    try {
      console.info(`Started puppeteer with process id: ${processId}`)

      const width = 1920
      const height = 1080
      const url = 'https://github.com'

      const [page] = await browser.pages()
      const recorder = new PuppeteerScreenRecorder(page, recordConfig)
      const savePath = './tmp/test.mp4'

      console.info('Setting viewport')
      await page.setViewport({ width, height })

      console.info('Starting recorder')
      await recorder.start(savePath)

      console.info('Going to url')
      await page.goto(url)

      console.info('Scrolling to end of page')
      // await autoScroll(page)
      await smoothAutoScroll(page)

      console.info('Stopping recorder')
      await recorder.stop()

      console.info('Closing browser')
      browser.close()
    } catch (error) {
      console.log(error)

      browser.close()
    }
  }

  return { example }
})()

const smoothAutoScroll = async (page: Page) => {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        let totalHeight = 1
        const docHeight = document.body.scrollHeight
        const delay = 1 //delay in milliseconds

        let timer = setInterval(() => {
          window.scroll(0, totalHeight)
          totalHeight += 5

          if (totalHeight >= docHeight) {
            clearInterval(timer)
            resolve()
          }
        }, delay)
      } catch (error) {
        reject(error)
      }
    })
  })
}

const autoScroll = async (page: Page) => {
  await page.evaluate(async () => {
    return await new Promise<void>((resolve, reject) => {
      try {
        let totalHeight = 0
        let distance = 100

        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 200)
      } catch (error) {
        reject(error)
      }
    })
  })
}
