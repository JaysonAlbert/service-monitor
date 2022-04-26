import { log } from "wechaty";
import { jobScheduler } from "./monitor/job-scheduler";
import { bot } from "./bot";
import {mode} from "./config/config";
import moment from "moment";



// @ts-ignore
if(mode === 'local'){
    jobScheduler.schedule((v: string) => {
        console.log(moment().format('YYYYmmDD hh:mm:ss') + ' ' + v)
    })
}else{
    bot.start().then(() => {
        log.info("TestBot", "started.");
    });
}


