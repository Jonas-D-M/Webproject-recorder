import { exec } from 'child_process'

export default (() => {
  const execute = (command: string) => {
    const output = exec(command, function (error, stdout, stderr) {
      if (error) {
        process.exit(2)
      }
      return stdout
    })
    console.log(output)
    return output
  }

  return { execute }
})()
