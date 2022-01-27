import puppeteer, { Browser, Page, Puppeteer } from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import fluent_ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { retry } from './utils'
import { Cluster } from 'puppeteer-cluster'

export default (() => {
  const initBrowser = async (executablePath: string) => {
    return new Promise<puppeteer.Browser>(async (resolve, reject) => {
      const minimalArgs = [
        '--autoplay-policy=user-gesture-required',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-popup-blocking',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-setuid-sandbox',
        '--disable-speech-api',
        '--disable-sync',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--password-store=basic',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
        '--start-maximized',
      ]

      const viewport = {
        deviceScaleFactor: 1,
        hasTouch: false,
        height: 1080,
        isLandscape: true,
        isMobile: false,
        width: 1920,
      }
      try {
        const browserConfig: puppeteer.LaunchOptions &
          puppeteer.BrowserLaunchArgumentOptions &
          puppeteer.BrowserConnectOptions = {
          executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
          args: minimalArgs,
          defaultViewport: viewport,
        }
        const browser = await puppeteer.launch(browserConfig)
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

  const initRecorder = (page: puppeteer.Page) => {
    return new Promise<PuppeteerScreenRecorder>(async (resolve, reject) => {
      try {
        const scrollDelay = 500
        const duration = await page.evaluate(
          scrollDelay =>
            (((document.body.scrollHeight - 1080) / 100) * scrollDelay +
              scrollDelay) /
            1000,
          scrollDelay,
        )

        console.log('the duration: ', duration)

        const recordConfig = {
          followNewTab: false,
          fps: 25,
          videoFrame: {
            width: 1920,
            height: 1080,
          },
          aspectRatio: '16:9',
          recordDurationLimit: duration,
        }
        const recorder = new PuppeteerScreenRecorder(page, recordConfig)
        console.log(`init recorder`)

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

  const recordLocalServer = async (
    executablePath: string,
    sitemap: Array<string>,
    isStatic: boolean,
  ) => {
    const url = 'http://127.0.0.1:3000'
    const browser = await initBrowser(executablePath)
    try {
      const urlMap = generateUrlMap(sitemap, url, isStatic)
      console.log(urlMap)

      console.info('Recording pages')

      await recordMultiplePages(browser, urlMap)

      console.info('Generating showcase video')
      await generateShowcaseVideo()

      console.info('Delete temp vid dir')
      fs.rmSync(path.join(process.cwd(), 'tmpvid'), { recursive: true })
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      await browser.close()
    }
  }

  const recordMultiplePages = async (
    browser: Browser,
    urlMap: Array<string>,
  ) => {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: 3,
    })
    try {
      let index = 1
      await cluster.task(async ({ page, data: url, worker }) => {
        await recordPage(page, url, `${index}-${worker.id}`)
        index++
      })
      cluster.on('taskerror', (err, data, willRetry) => {
        if (willRetry) {
          console.warn(
            `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`,
          )
        } else {
          console.error(`Failed to crawl ${data}: ${err.message}`)
        }
      })
      urlMap.forEach(url => {
        console.log(url)

        cluster.queue(url)
      })
    } catch (error) {
      throw error
    } finally {
      await cluster.idle()
      await cluster.close()
    }
  }

  const generateShowcaseVideo = (vidName?: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const videoName = vidName ?? 'showcase-video.mp4'

        let mergedVideo = fluent_ffmpeg()

        const tmpDirPath = path.join(process.cwd(), 'tmpvid')
        const finalDirPath = path.join(process.cwd(), 'video')
        const showcaseVidPath = `${process.cwd()}/video/${videoName}`

        fs.promises.mkdir(path.dirname(showcaseVidPath), { recursive: true })

        const tmpVideos = fs
          .readdirSync(tmpDirPath)
          .map(f => path.join(tmpDirPath, f))

        console.log(tmpVideos)

        tmpVideos.forEach(vid => {
          mergedVideo = mergedVideo.addInput(vid)
        })
        // create file if not exists
        mergedVideo
          .mergeToFile(showcaseVidPath)
          .on('error', err => {
            throw err
          })
          .on('end', () => resolve())
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  const generateUrlMap = (
    routes: Array<string>,
    baseUrl: string,
    isHTML = false,
  ) => {
    return routes.map(route => `${baseUrl}${route}${isHTML ? '.html' : ''}`)
  }

  const recordPage = async (page: Page, url: string, index: string) => {
    // const [page] = await browser.pages()
    const resolution = { width: 1920, height: 1080 }
    await initViewport(page, resolution)
    // await retry(() => page.goto(url, { waitUntil: 'load' }), 1000)
    await page.goto(url, { waitUntil: 'load' })
    const recorder = await initRecorder(page)
    console.log('Starting recorder')
    await recorder.start(`./tmpvid/tmp-${index}.mp4`)
    console.log('autoscrolling')
    await autoScroll(page)
    console.log('autoscrolling stopped')
    await recorder.stop()
    console.log('recorder stopped')
    await page.close()
  }

  const getAllPages = (isHtml: boolean, chromePath: string) => {
    console.log('getting all the pages...')

    return new Promise<Array<string>>(async (resolve, reject) => {
      try {
        const baseurl = `http://127.0.0.1:3000`

        const browser = await initBrowser(chromePath)
        const page = await browser.newPage()
        await retry(
          () =>
            page.goto(`${baseurl}/index${isHtml ? '.html' : ''}`, {
              waitUntil: 'networkidle0',
            }),
          1000,
        )
        const hrefs = [
          ...new Set(
            await page.evaluate(() =>
              Array.from(document.getElementsByTagName('a'), links =>
                links.href
                  .replace('http://127.0.0.1:3000', '')
                  .replace('#', '')
                  .replace('.html', ''),
              ),
            ),
          ),
        ]
        const filteredHrefs = hrefs.filter(href => !href.includes('http'))
        resolve(filteredHrefs)
        browser.close()
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  return { recordLocalServer, getAllPages }
})()

const smoothAutoScrollV2 = async (page: Page) => {
  page.on('console', async msg => {
    const msgArgs = msg.args()
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue())
    }
  })
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      try {
        const totalHeight = document.body.scrollHeight
        const viewport = window.innerHeight
        let topP = 0
        const timer = setInterval(() => {
          window.scrollBy({ top: topP, behavior: 'smooth' })

          topP = topP + viewport
          if (topP >= totalHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 1500)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  })
}

const smoothAutoScroll = async (page: Page) => {
  page.on('console', async msg => {
    const msgArgs = msg.args()
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue())
    }
  })
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        let totalHeight = 0
        const docHeight = document.body.scrollHeight
        const delay = 1 //delay in milliseconds

        let timer = setInterval(() => {
          window.scroll(0, totalHeight)
          totalHeight += 5

          if (totalHeight > docHeight) {
            console.log(totalHeight)

            clearInterval(timer)
            resolve()
          }
        }, delay)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  })
}

const autoScroll = async (page: Page) => {
  await page.evaluate(
    (recorder: PuppeteerScreenRecorder) =>
      new Promise<void>(async (resolve, reject) => {
        try {
          let totalHeight = 0
          let distance = 100
          let firstTime = true
          const timer = setInterval(() => {
            let scrollHeight = document.body.scrollHeight
            if (totalHeight >= scrollHeight) {
              console.log('clear interval')
              clearInterval(timer)
              console.log('interval cleared')

              resolve()
            }
            if (!firstTime) {
              window.scrollBy(0, distance)
              totalHeight += distance
            } else {
              firstTime = false
            }
          }, 500)
        } catch (error) {
          reject(error)
          throw error
        }
      }),
  )
}
