import {Contact, log, Message, ScanStatus, Wechaty} from "wechaty";
import {appAddress, ServiceHost} from "./services/address";
import Job from "./monitor/job";
import {JobScheduler} from "./monitor/job-scheduler";
import {group} from "./config/config";
import moment from "moment";


const help = '1. #监控　[环境]　[系统名]\n　' +
            '\teg: #监控 uat csp \n\n' +
            '2. #监控 [环境]　[系统名] [地址]　[端口]\n'　+
            '\teg: #监控 sit newecc 10.50.115.61 7679\n\n' +
            '3. #列表 \n\n'　+
            '\t注：eureka项目使用第一种自动获取地址\n' +
            '\t\t老项目使用第二种คิดถึง'

async function onLogin(user: Contact) {
    log.info('StarterBot', '%s login', user)
    let contact = await bot.Room.find({'topic': group})
    if (!contact) {
        console.log(`无法找到联系人[${group}]`)
    }
    console.log("正在添加监控器...")
    JobScheduler.schedule((v: string) => {
        if (contact) {
            contact.say(v)
        } else {
            console.log(moment().format('YYYYmmDD hh:mm:ss') + ' ' + v)
        }
    })
}

const bot = new Wechaty({
    name: "TestBot",
    puppet: "wechaty-puppet-padlocal",
    puppetOptions: {token: "puppet_padlocal_9ecde6faebd0491c8b15f80e1a4b08be",}
})

    .on("scan", (qrcode: string, status: ScanStatus) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

            require('qrcode-terminal').generate(qrcode, {small: true})  // show qrcode on console
        } else {
            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
    })

    .on("login", onLogin)

    .on("logout", (user: Contact, reason: string) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);
    })

    .on("message", async (message: Message) => {
        if (!message) {
            return
        }

        try{
            log.info("TestBot", `on message: ${message.toString()}`);
        }catch (error) {
            log.error("",error)
        }

        if (message.type() !== Message.Type.Text) {
            return
        }

        message.room()?.topic().then(topic => {
            if (topic != group) {
                return
            }
            const msg = message.text();
            if (msg.startsWith('#监控')) {
                const l = msg.split(' ')
                if(l.length === 3){
                    appAddress(l[2], l[1]).then((host: ServiceHost) => {
                        const job = Job.fromHost(host)
                        console.log(`正在添加监控${JSON.stringify(job)}`)
                        JobScheduler.addJob(job)
                        JobScheduler.save()
                        message.say('监控添加成功')
                    }, error => {
                        if(error&&error.msg){
                            message.say(error.msg)
                        }
                    }).catch(error => {
                        message.say(error)
                    })
                }else if(l.length === 5){
                    const job = new Job(l[2],l[1],l[3],l[4])
                    JobScheduler.addJob(job)
                    JobScheduler.save()
                    message.say('监控添加成功คิดถึง')
                }else{
                    message.say('指令解析失败\n\n\n' + help)
                }

            } else if (msg.startsWith('#help') || msg.startsWith('#帮助')) {
                message.room()?.say(
                    help
                )
            } else if (msg.startsWith('#list') || msg.startsWith('#列表')) {
                message.room()?.say(`#已监控系统：\n${JobScheduler.listJobs()}`)
            }
        }).catch(error => {
            message.say(error)
        })

    })

    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
    })

export {
    bot
}
