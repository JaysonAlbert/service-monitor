const isReachable = require('is-reachable')
const fs = require('fs')

export default class Job {
  public readonly name : String
  public readonly env: String
  public readonly host: String
  public readonly port: String
  public readonly address: String
  public readonly fid: String

  constructor(name: String, env: String, host: String, port: String) {
    this.name = name
    this.env = env
    this.port = port
    this.host = host
    this.address = `http://${this.host}:${this.port}`
    this.fid = `${this.name}.${this.host}.${port}.id`
  }

   public updateStatus(callback: Function = console.info) {
    fs.access(this.fid, ((err: boolean) => {
      isReachable(this.address).then((reachable: boolean) => {
        if(err && reachable){ //进程文件不存在且当前网络可达，说明系统刚启动
          fs.closeSync(fs.openSync(this.fid, 'w')) //新建进程文件，并打印日志
          callback(`${this.env}-${this.name}已经更新`)
        }

        if(!err && !reachable) { //进程文件存在且当前网络不可达，说明系统刚停止
          fs.unlinkSync(this.fid)
          callback(`${this.env}-${this.name}已经停止`)
        }
      })
    }))
  }
}
