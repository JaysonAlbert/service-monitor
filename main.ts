import { log } from "wechaty";
import { jobScheduler } from "./monitor/job-scheduler";
import { bot } from "./bot";
import {mode} from "./config/config";
import moment from "moment";
import { localMonitor } from "./monitor/util";



// @ts-ignore
if(mode === 'local'){
    jobScheduler.schedule((v: string) => {
        localMonitor(v)
    })
}else{
    bot.start().then(() => {
        log.info("TestBot", "started.");
    });
}


