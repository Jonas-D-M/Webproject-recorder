import fs from 'fs'

interface ReplaceSectionOpts {
  section: string
  newContents: string
  oldContents: string
}

export default (() => {
  const getReadme = (projectDir: string, filename: string) => {
    return new Promise<string>((resolve, reject) => {
      try {
        const path = `${projectDir}/${filename}`
        if (!fs.existsSync(path)) {
          fs.writeFileSync(path, '', {
            encoding: 'utf-8',
            flag: 'w',
          })
        }
        resolve(fs.readFileSync(path, 'utf-8'))
      } catch (error) {
        reject(error)
      }
    })
  }

  const createRegExp = (section: string) => {
    const start = `<!--START_SECTION:${section}-->`
    const end = `<!--END_SECTION:${section}-->`
    const regex = new RegExp(`${start}\n(?:(?<content>[\\s\\S]+)\n)?${end}`)
    return { regex, start, end }
  }

  const getSection = (section: string, content: string) => {
    const { regex } = createRegExp(section)
    const match = content.match(regex)
    return match?.groups?.content
  }

  const replaceSection = (opts: ReplaceSectionOpts) => {
    const { regex, start, end } = createRegExp(opts.section)

    let newContent: string

    if (!regex.test(opts.oldContents)) {
      console.info('No section found, adding it to the bottom of the file...')
      const start = `<!--START_SECTION:${opts.section}-->`
      const end = `<!--END_SECTION:${opts.section}-->`
      newContent = `${opts.oldContents}\n${start}\n${opts.newContents}\n${end}`
    } else {
      const newContentsWithComments = `${start}\n${opts.newContents}\n${end}`
      newContent = opts.oldContents.replace(regex, newContentsWithComments)
    }
    return newContent
  }

  return {
    getSection,
    replaceSection,
    getReadme,
  }
})()
