
// todo generate random time
import {addToQueue} from "./queue";
import {LOGS_QUEUE_ID} from "../consts/queues";
import {Log} from "../types";

const interval = 1000;

function generateLog():Log {
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
