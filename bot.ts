import {Contact, log, Message, ScanStatus, Wechaty} from "wechaty";
import {appAddress, ServiceHost} from "./services/address";
import Job from "./monitor/job";
import {JobScheduler} from "./monitor/job-scheduler";
import {group} from "./config/config";


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
            console.log(v)
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

        log.info("TestBot", `on message: ${message.toString()}`);
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
                appAddress(l[1], l[2]).then((host: ServiceHost) => {
                    const job = Job.fromHost(host)
                    console.log(`正在添加监控${JSON.stringify(job)}`)
                    JobScheduler.addJob(job)
                    JobScheduler.save()
                }, error => {
                    if(error&&error.msg){
                        message.say(error.msg)
                    }
                }).catch(error => {
                    message.say(error)
                })
            } else if (msg.startsWith('#help') || msg.startsWith('#帮助')) {
                message.room()?.say(
                    '1. #监控　[系统名]　[环境]\n　' +
                    '   eg: #监控 csp uat \\n' +
                    '2. #列表')
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
