import axios from 'axios'

const  registries = new Map([
    ["sit", "http://10.50.115.158:8761/"],
    ["uat", "http://10.50.115.148:8761/"]
]);

interface Instance {
    ipAddr: string,
    port: Port
}

interface Port{
    '$': string
}

export class ServiceHost {
    name: string
    ip: string
    port: string
    env: string
    constructor(name: string, instance: Instance, env: string) {
        this.name = name
        this.ip = instance.ipAddr
        this.port = instance.port['$']
        this.env = env
    }
}

export function appAddress(app: string, env: string) {
    if(!registries.has(env)){
        console.log(`无法找到环境${env}`)
    }

    return new Promise((resolve: (serviceHost: ServiceHost) => void, reject) => {
        const address = registries.get(env)

        const url = `${address}eureka/apps/${app.toUpperCase()}`
        axios.get(url,{
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => {
            resolve(new ServiceHost(app, response.data.application.instance[0],env))
        }).catch(e => {
            reject({"msg": `获取服务地址异常，请检查网络: ${url}`, error: e})
        })
    })
}

appAddress("csp", "sit")
