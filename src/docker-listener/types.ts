import { initDockerListener } from './docker-listener';

export type DockerListener = ReturnType<typeof initDockerListener>;

export type RawLog = { buf: Buffer<ArrayBufferLike>; from: string };
