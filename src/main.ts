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

init();
