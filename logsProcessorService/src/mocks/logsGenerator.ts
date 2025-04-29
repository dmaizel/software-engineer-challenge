
// todo generate random time
import {addToQueue} from "./queue.ts";
import {LOGS_QUEUE_ID} from "../consts/queues.ts";

const interval = 5000;

export function generateLog() {
    // todo generate random log
    return {
        service: 'service_name',
        severity: 'info',
        message: 'logs message',
        timestamp: Date.now(),
    }
}

setInterval(() => {
    const log = generateLog();
    addToQueue(JSON.stringify(log), LOGS_QUEUE_ID)
    console.log('log generated', log)
}, interval)
