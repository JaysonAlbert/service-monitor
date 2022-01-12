import Job from "./job";
const fs = require("fs")

const schedule = require('node-schedule')

const confPath = "config/scheduler.json"

class JobScheduler{
  public readonly date: String
  public jobs: Array<Job> = []
  public instance: any = null;

  constructor(date: String) {
    this.date = date
  }

  public addJob(job: Job) {
    this.jobs.push(job)
    job.initStatus()
  }

  static Instance() {
    let jobScheduler: JobScheduler;
    try {
      jobScheduler = JobScheduler.fromConfig()
      console.log(`从配置文件初始化成功: ${JSON.stringify(jobScheduler)}`)
    } catch (err) {
      console.log(`从配置配置文件初始化失败...`)
      jobScheduler = new JobScheduler('*/5 * * * * *')
    }
    return jobScheduler;
  }

  static fromConfig() {
    const config = JSON.parse(fs.readFileSync(confPath))
    const jobScheduler = new JobScheduler(config.date)
    for(let job of config.jobs){
      jobScheduler.addJob(new Job(job.name, job.env, job.host, job.port))
    }
    return jobScheduler
  }

  listJobs(){
    if(!this.jobs){
      return '暂无服务监控'
    }
    return this.jobs.map(job => job.env + '-' + job.name).sort().join('\n')
  }

  save(){
    const jsonString = JSON.stringify(this, null, 2)
    fs.writeFile(confPath, jsonString, (err: any) => {
      if(err){
        console.error(err)
      }
    })
  }

  schedule(callback: Function = console.info) {
    schedule.scheduleJob(this.date, () => {
      this.jobs.forEach(job => {
        job.updateStatus(callback)
      })
    })
  }
}

//初始化
const jobScheduler =　JobScheduler.Instance();

export {
  jobScheduler as JobScheduler
}
