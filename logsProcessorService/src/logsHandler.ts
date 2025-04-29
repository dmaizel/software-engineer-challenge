// @ts-ignore
import {LOGS_QUEUE_ID, NEW_MESSAGE_EVENT} from "./consts/queues.ts";
// @ts-ignore
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// @ts-ignore
import {getFromQueue} from "./mocks/queue.ts";
// @ts-ignore
import {emitter} from "./mocks/events.ts";

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//todo separate to time frame files
const logsDir = '../logs';
const logsFileName = 'logFile.txt'
const dirPath = join(__dirname, logsDir);
const filePath = join(dirPath, logsFileName);

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function writeLog(logAsString: string) {
    const isExist = await fileExists(filePath)
    if (!isExist) {
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, logAsString + '\n');
        return;
    }
    await fs.appendFile(filePath, logAsString + '\n');

}

emitter.on(NEW_MESSAGE_EVENT + LOGS_QUEUE_ID, () => {
    const logAsString = getFromQueue(LOGS_QUEUE_ID)
    const log = JSON.parse(logAsString);
    console.log('new log logsHandler', log);
    // todo process the log
    writeLog(logAsString);
    // todo send alert if necessary
})
export const a = 1;