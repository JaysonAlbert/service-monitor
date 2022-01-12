import axios from "axios";
import Job from "./job";

const { Telnet } = require('telnet-client')

export function isReachable(job: Job) {
    const connection = new Telnet()
    return new Promise((resolve: (reachable: boolean) => void) => {
        connection.connect({
            host: job.host,
            port: job.port,
            negotiationMandatory: false,
            timeout: 1500
        }).then(()=>{
            resolve(true)
        }).catch((error: any) => {
            resolve(false)
        })
    })
}
