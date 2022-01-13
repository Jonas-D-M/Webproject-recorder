import puppeteer, { Page, Puppeteer } from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'

export default (() => {
  const initBrowser = async () => {
    return new Promise<puppeteer.Browser>(async (resolve, reject) => {
      try {
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
        const browser = await puppeteer.launch(browserConfig).then(async br => {
          return br
        })
        console.info(
          `Browser is running with process id ${browser.process()?.pid}`,
        )
        resolve(browser)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  const initRecording = async (
    page: puppeteer.Page,
    savePath: string,
    ffmpegPath: string,
  ) => {
    return new Promise<PuppeteerScreenRecorder>((resolve, reject) => {
      try {
        const recordConfig = {
          followNewTab: true,
          fps: 60,
          ffmpeg_Path: ffmpegPath,
          videoFrame: {
            width: 1920,
            height: 1080,
          },
          aspectRatio: '16:9',
        }
        const recorder = new PuppeteerScreenRecorder(page, recordConfig)
        recorder.start(savePath)
        resolve(recorder)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  const initViewport = async (
    page: puppeteer.Page,
    resolution: { width: number; height: number },
  ) => {
    console.info('Setting viewport')
    await page.setViewport(resolution)
  }

  const example = async (ffmpegPath: string) => {
    const browser = await initBrowser()
    const url = 'https://github.com'
    const resolution = { width: 1920, height: 1080 }
    const savePath = './tmp/test.mp4'

    const [page] = await browser.pages()

    await initViewport(page, resolution)
    const recorder = await initRecording(page, savePath, ffmpegPath)
    try {
      console.info('Going to url')
      await page.goto(url)

      console.info('Scrolling to end of page')
      await smoothAutoScroll(page)

      console.info('Stopping recorder')
      await recorder.stop()

      console.info('Closing browser')
      browser.close()
    } catch (error) {
      console.log(error)
      recorder.stop()
      browser.close()
      throw error
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
