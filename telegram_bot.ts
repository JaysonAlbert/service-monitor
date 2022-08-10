import Job from "./monitor/job";
import { jobScheduler } from "./monitor/job-scheduler";
import { localMonitor } from "./monitor/util";
import { appAddress, ServiceHost } from "./services/address";
const fs = require('fs');

const TelegramBot = require('node-telegram-bot-api');

const token = '1234:abcd';

class TBot{
  private token: String;
  private bot: any = null;

  public constructor(token: String){
    this.token = token
    this.bot = new TelegramBot(token, {polling: true,request: {
      proxy: "http://localhost:12333",
    },});
  }

  public start(){
    this.bot.onText(/\/help/, (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const resp = match[1]; // the captured "whatever"
    
      // send back the matched "whatever" to the chat
      this.bot.sendMessage(chatId, help);
    });
    
    this.bot.onText(/\/监控 (.+)/, (msg: any, match: any) => {
    
      const chatId = msg.chat.id;
    
      const l = msg.text.split(' ')
      if (l.length === 3) {
          appAddress(l[2], l[1]).then((host: ServiceHost) => {
              const job = Job.fromHost(host)
              console.log(`正在添加监控${JSON.stringify(job)}`)
              jobScheduler.addJob(job)
              jobScheduler.save()
              this.bot.sendMessage(chatId, '监控添加成功คิดถึง')
          }, error => {
              if (error && error.msg) {
                this.bot.sendMessage(chatId, error.msg)
              }
          }).catch(error => {
            this.bot.sendMessage(chatId,error)
          })
      } else if (l.length === 5) {
          const job = new Job(l[2], l[1], l[3], l[4])
          jobScheduler.addJob(job)
          jobScheduler.save()
          this.bot.sendMessage(chatId,'监控添加成功คิดถึง')
      } else {
        this.bot.sendMessage(chatId,'指令解析失败\n\n\n' + help)
      }
    
      this.bot.sendMessage(chatId, help);
    });
    
    this.bot.onText(/\/(list)|(列表)/, (msg: any, match: any) => {
      const chatId = msg.chat.id;
    
      this.bot.sendMessage(chatId, `#已监控系统：\n${jobScheduler.listJobs()}`);
    });
    
    this.bot.onText(/\/start/, (msg: any, match: any) => {
      try{
        const chatId = msg.chat.id;
    
        jobScheduler.addChatId(chatId)
        this.bot.sendMessage(chatId, `启用成功`);
      }catch(err){
        console.log(err)
      }
      
    });

    jobScheduler.schedule((v: string) => {
      for(const id of jobScheduler.chatIds){
        console.log(`正在发送通知到${id}`)
        this.bot.sendMessage(id, v)
      }
      localMonitor(v)
  })
  }
}

const help = '1. #监控　[环境]　[系统名]\n　' +
    '\teg: #监控 uat csp \n\n' +
    '2. #监控 [环境]　[系统名] [地址]　[端口]\n' +
    '\teg: #监控 sit newecc 10.50.115.61 7679\n\n' +
    '3. #列表 \n\n' +
    '\t注：eureka项目使用第一种自动获取地址\n' +
    '\t\t老项目使用第二种คิดถึง'

// Create a bot that uses 'polling' to fetch new updates
const bot = new TBot(token);

export {
  bot as telegram,
}