export default (() => {
  let seconds = 0
  let startDate: Date, stopDate: Date

  const startTimer = () => {
    startDate = new Date()
  }

  const stopTimer = () => {
    stopDate = new Date()
  }

  const getDuration = () => {
    return (stopDate.getTime() - startDate.getTime()) / 1000
  }

  return {
    getDuration,
    stopTimer,
    startTimer,
  }
})()
