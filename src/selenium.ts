import { By, Key, Builder } from 'selenium-webdriver'
// import driver from 'chromedriver'

export default (() => {
  const example = async () => {
    var searchString = 'Automation testing with Selenium and JavaScript'

    //To wait for browser to build and launch properly
    const browser = await new Builder().forBrowser('chrome').build()

    //To fetch http://google.com from the browser with our code.
    await browser.get('http://google.com')

    //To send a search query by passing the value in searchString.
    await browser.findElement(By.name('q')).sendKeys(searchString, Key.RETURN)

    //Verify the page title and print it
    var title = await browser.getTitle()
    console.log('Title is:', title)

    //It is always a safe practice to quit the browser after execution
    await browser.quit()
  }

  return {
    example,
  }
})()
