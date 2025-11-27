import Docker from 'dockerode';

export async function* initDockerListener() {
  console.info('start listening to docker container');

  const docker = new Docker();

  const id = '46de3d581fb0d3a2f1719c6d66a0ba2bbaebd897d6f1a17621f11deca268001d';

  const container = docker.getContainer(id);

  const stream: NodeJS.ReadableStream = await new Promise((resolve, reject) => {
    container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
      if (err) {
        console.error('Error attaching to container:', err);
        return reject(err);
      }

      return resolve(stream);
    });
  });

  for await (const chunk of stream) {
    yield chunk.toString();
  }
}
