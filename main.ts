import { PuppetPadlocal } from "wechaty-puppet-padlocal";
import { Contact, log, Message, ScanStatus, Wechaty } from "wechaty";
import JobScheduler from "./monitor/job-scheduler";
import Job from "./monitor/job";

const jobScheduler = new JobScheduler('*/5 * * * * *')
const job = new Job('csp', 'dev', 'localhost', '9528')
jobScheduler.addJob(job)

async function onLogin (user: Contact) {
    log.info('StarterBot', '%s login', user)
    const group = '啦啦啦'
    const roomuList = await bot.Room.findAll()
    console.log(roomuList)
    let contact = await bot.Room.find({'topic': group})
    if(!contact){
      console.log(`无法找到联系人[${group}]`)
    }
    console.log("正在添加监控器...")
    jobScheduler.schedule((v: string) => {
      if(contact){
        contact.say(v)
      }else{
        console.log(v)
      }
    })
  }


const bot = new Wechaty({
    name: "TestBot",
     puppet: "wechaty-puppet-padlocal",
     puppetOptions: { token:"puppet_padlocal_c8075fd7ce5e470bbb6032f613ccd0c3", } 
})

    .on("scan", (qrcode: string, status: ScanStatus) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

            require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
        } else {
            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
    })

    .on("login", onLogin)

    .on("logout", (user: Contact, reason: string) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);
    })

    .on("message", async (message: Message) => {
        log.info("TestBot", `on message: ${message.toString()}`);
    })

    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
    })


bot.start().then(() => {
    log.info("TestBot", "started.");
});

