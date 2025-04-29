// @ts-ignore
import {NEW_MESSAGE_EVENT} from "../consts/queues.ts";
// @ts-ignore
import {emitter} from "./events.ts";

const queues: Record<string, string[]> = {};
 // todo implement lock
// todo implement pub sub

function isEmpty(queueId: string) {
    return queues[queueId].length === 0;
}
function isQueueExist(queueId: string) {
    return queues[queueId];
}

export function addToQueue(item: string, queueId: string) {
    if (!isQueueExist(queueId)) {
        queues[queueId] = [];
        console.log("new queue created with queue id", queueId);
    }
    queues[queueId].push(item);
    console.log("new message pushed to queue with queue id " + queueId, item);
    emitter.emit(NEW_MESSAGE_EVENT + queueId);
}

export function getFromQueue(queueId: string): string | undefined {
    console.log('getFromQueue', queueId);
    if(!isQueueExist(queueId) || isEmpty(queueId)) {
        return undefined;
    }
    return queues[queueId].shift();
}