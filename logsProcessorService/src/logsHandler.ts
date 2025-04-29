// todo fix this ts error
//@ts-ignore
import eventEmitter from "node:events";
import {LOGS_QUEUE_ID, NEW_MESSAGE_EVENT} from "./consts/queues";
import {getFromQueue} from "./mocks/queue";
import {Log} from "./types";

eventEmitter.on(NEW_MESSAGE_EVENT + LOGS_QUEUE_ID, () => {
    const log = JSON.parse(getFromQueue(LOGS_QUEUE_ID)) as Log;
    console.log('new log logs handler', log);
    // todo process the log
    // todo store the log
    // todo send alert if necessary
})