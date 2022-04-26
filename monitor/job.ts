import {ServiceHost} from "../services/address";
import {isReachable} from "./util";
import {JobScheduler} from "./job-scheduler";

const fs = require('fs')

export default class Job {
  public readonly name : string
  public readonly env: string
  public readonly host: string
  public readonly port: string
  public readonly address: string
  public readonly fid: string

  constructor(name: string, env: string, host: string, port: string) {
    this.name = name
    this.env = env
    this.port = port
    this.host = host
    this.address = `http://${this.host}:${this.port}`
    this.fid = `sid/${this.name}.${this.host}.${port}.id`
  }

  static fromHost(host: ServiceHost) {
    return new Job(host.name, host.env, host.ip, host.port)
  }

  public key(){
    return this.env + '-' + this.name
  }

   public updateStatus(callback: Function = console.info) {
    fs.access(this.fid, ((err: boolean) => {
      isReachable(this).then((reachable: boolean) => {
        if(err && reachable){ //进程文件不存在且当前网络可达，说明系统刚启动
          fs.closeSync(fs.openSync(this.fid, 'w')) //新建进程文件，并打印日志
          callback(`${this.env}-${this.name}已经更新`)
        }

        if(!err && !reachable) { //进程文件存在且当前网络不可达，且gitlab可达，说明系统刚停止
          isReachable(JobScheduler.gitlabJob).then((reachable2: boolean) => {
            if(reachable2){
              fs.unlinkSync(this.fid)
              callback(`${this.env}-${this.name}已经停止`)
            }
          })
        }
      })
    }))
  }

  public initStatus() {
    isReachable(this).then((reachable: boolean) => {
      if(reachable) {
        fs.closeSync(fs.openSync(this.fid, 'w')) //新建进程文件
      }else{
        fs.access(this.fid, ((err: boolean) => {
          if(!err){
            fs.unlinkSync(this.fid)
          }
        }))
      }
    })
  }
}
