import Job from "./job";
const fs = require("fs")

const schedule = require('node-schedule')

const confPath = "config/scheduler.json"

class JobScheduler{
  public readonly date: String
  public jobs: Array<Job> = []
  public jobSet: Set<string> = new Set()
  public static gitlabJob: Job = new Job("gitlab","prod","gitlab.hfffund.com","80");
  public static instance: any = null;

  private constructor(date: String) {
    this.date = date
  }

  public addJob(job: Job) {
    if(this.jobSet.has(job.key())){
      return
    }
    this.jobs.push(job)
    this.jobSet.add(job.key())
    job.initStatus()
  }

  static Instance() {
    if(this.instance){
      return this.instance
    }
    try {
      this.instance = JobScheduler.fromConfig()
      console.log(`从配置文件初始化成功: ${JSON.stringify(this.instance)}`)
    } catch (err) {
      console.log(`从配置配置文件初始化失败...`)
      this.instance = new JobScheduler('*/15 * * * * *')
    }
    return this.instance;
  }

  static fromConfig() {
    const config = JSON.parse(fs.readFileSync(confPath))
    const local = new JobScheduler(config.date)
    for(let job of config.jobs){
      local.addJob(new Job(job.name, job.env, job.host, job.port))
    }
    JobScheduler.gitlabJob = new Job(config.gitlabJob.name, config.gitlabJob.env, config.gitlabJob.host, config.gitlabJob.port)
    return local
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
  jobScheduler as jobScheduler,
  JobScheduler as JobScheduler
}
