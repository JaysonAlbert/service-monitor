import { log } from "wechaty";
import { JobScheduler } from "./monitor/job-scheduler";
import { bot } from "./bot";
import {mode} from "./config/config";



if(mode === 'local'){
    JobScheduler.schedule()
}else{
    bot.start().then(() => {
        log.info("TestBot", "started.");
    });
}


