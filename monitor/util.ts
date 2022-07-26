import Job from "./job";
import moment from "moment";

const { Telnet } = require('telnet-client')
const { exec } = require('child_process');

const is_linux = process.platform === "linux" ? true : false

export function isReachable(job: Job) {
    const connection = new Telnet()
    return new Promise((resolve: (reachable: boolean) => void) => {
        connection.connect({
            host: job.host,
            port: job.port,
            negotiationMandatory: false,
            timeout: 5000
        }).then(()=>{
            resolve(true)
        }).catch((error: any) => {
            resolve(false)
        })
    })
}

export function localMonitor(msg: String) {
    var short_now = moment().format('HH:mm:ss')
    var long_now = moment().format('YYYYMMDD HH:mm:ss')

    if(is_linux){
        exec(`which notify-send > /dev/null 2>&1 && notify-send -u critical "${short_now} ${msg}"`,(err: any,stdout: any,stderr: any) => {
            if(err){
                console.error(err)
            }
            if(stderr){
                console.error(stderr)
            }
            if(stdout){
                console.log(stdout)
            }
        })
    }
    
    console.log(long_now + ' ' + msg)
}