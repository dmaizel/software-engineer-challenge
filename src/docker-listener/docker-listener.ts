import Docker from 'dockerode';
import { RawLog } from './types';

export async function* initDockerListener() {
  console.info('start listening to docker container');

  const docker = new Docker();

  const ids = [
    'c0287bf3a75e2c4738edf8e3103bf769d10d5527950965165fc6aee8fe62ddda',
    '379234219a91e8f698c1eee1dee59cdda17a8d2a33552ef1597946409be29e2b',
  ];

  for (const id of ids) {
    const container = docker.getContainer(id);

    const stream: NodeJS.ReadableStream = await new Promise((resolve, reject) => {
      container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
        if (err) {
          console.error('Error attaching to container:', err);
          //todo: add error handling
          return reject(err);
        }

        return resolve(stream);
      });
    });

    for await (const chunk of stream) {
      if (typeof chunk !== 'string') yield { buf: chunk, from: id } satisfies RawLog;
    }
  }
}
