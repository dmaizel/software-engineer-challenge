import { initDockerListener } from './docker-listener';

const init = async () => {
  console.info('init!');

  const logsGenerator = initDockerListener();

  for await (const logChunk of logsGenerator) {
    console.log({ logChunk });
  }
};

init();
