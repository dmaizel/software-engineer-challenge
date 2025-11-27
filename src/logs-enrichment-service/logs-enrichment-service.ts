import { DockerListener, RawLog } from '../docker-listener/types';
import { LogsPersistentStorage } from '../logs-persistent-storage/logs-persistent-storage';
import { EnrichedLog } from './types';

export class LogsEnrichmentService {
  constructor(
    private readonly dockerListener: DockerListener,
    private readonly logsPersistentStorage: LogsPersistentStorage,
  ) {}

  async process() {
    for await (const logChunk of this.dockerListener) {
      const enrichedLog = this.enrichLog(logChunk);

      await this.logsPersistentStorage.queue(enrichedLog);
    }
  }

  parseDockerLogChunk(buf: Buffer): Pick<EnrichedLog, 'message' | 'logLevel'> {
    const streamType = buf[0]; // 1=stdout, 2=stderr
    const logLevel = streamType === 1 ? 'info' : 'error';
    // payload starts at byte 8
    const message = buf.slice(8).toString('utf-8').trim();
    return { logLevel, message };
  }

  enrichLog(log: RawLog): EnrichedLog {
    const { logLevel, message } = this.parseDockerLogChunk(log.buf);

    return {
      containerId: log.from,
      message,
      timestamp: new Date().toISOString(),
      logLevel,
    };
  }
}
