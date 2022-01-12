import Job from "./job";
import {JobScheduler} from "./job-scheduler";

const job = new Job('csp', 'dev', 'localhost', '9527')
JobScheduler.addJob(job)
JobScheduler.schedule()
