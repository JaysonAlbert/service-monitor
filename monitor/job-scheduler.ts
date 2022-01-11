import Job from "./job";

const schedule = require('node-schedule')

export default class JobScheduler{
  public readonly date: String
  public jobs: Array<Job> = []

  constructor(date: String) {
    this.date = date
  }

  public addJob(job: Job) {
    this.jobs.push(job)
  }

  schedule(callback: Function = console.info) {
    schedule.scheduleJob(this.date, () => {
      this.jobs.forEach(job => {
        job.updateStatus(callback)
      })
    })
  }
}
