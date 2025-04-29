import {LOGS_QUEUE_ID, NEW_MESSAGE_EVENT} from "./consts/queues.ts";
import {getFromQueue} from "./mocks/queue.ts";
import {emitter} from "./mocks/events.ts";

emitter.on(NEW_MESSAGE_EVENT + LOGS_QUEUE_ID, () => {
    const log = JSON.parse(getFromQueue(LOGS_QUEUE_ID));
    console.log('new log logs handler', log);
    // todo process the log
    // todo store the log
    // todo send alert if necessary
})
export const a = 1;