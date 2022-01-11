import JobScheduler from "./job-scheduler";
import Job from "./job";

const jobScheduler = new JobScheduler('*/5 * * * * *')
const job = new Job('csp', 'dev', 'localhost', '9527')
jobScheduler.addJob(job)
jobScheduler.schedule()
