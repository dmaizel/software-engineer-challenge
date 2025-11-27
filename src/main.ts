import 'dotenv/config';

import { initDockerListener } from './docker-listener/docker-listener';
import { LogsEnrichmentService } from './logs-enrichment-service/logs-enrichment-service';
import { LogsPersistentStorage } from './logs-persistent-storage/logs-persistent-storage';

const init = async () => {
  console.info('init!');

  const logsGenerator = initDockerListener();

  const logsPersistentStorage = new LogsPersistentStorage();

  const logsEnrichmentService = new LogsEnrichmentService(logsGenerator, logsPersistentStorage);

  logsEnrichmentService.process();
};

class Api {
  private readonly logsPersistentStorage = new LogsPersistentStorage();
  async getLogs(timestamp?: string, logLevel?: string) {
    return this.logsPersistentStorage.getLogs(timestamp, logLevel, 20, 0);
  }

  async getCount(timestamp?: string, logLevel?: string) {
    return this.logsPersistentStorage.count(timestamp, logLevel);
  }
}

const useApi = async () => {
  const api = new Api();

  // const logs = await api.getLogs('2025-11-27T14:35:13.479Z');
  const logs = await api.getCount(undefined, 'info');
  console.log({ logs });
};

useApi();

// init();
