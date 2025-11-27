import { EnrichedLog } from '../logs-enrichment-service/types';

import { PrismaClient } from '@prisma/client';

export class LogsPersistentStorage {
  private readonly prisma = new PrismaClient();

  async queue(enrichedLog: EnrichedLog) {
    this.upsert(enrichedLog);
    //todo: add queue!
  }

  async upsert(enrichedLog: EnrichedLog) {
    await this.prisma.log.create({
      data: enrichedLog,
    });
  }

  async test() {
    console.log(await this.prisma.log.count());
  }

  async getLogs(timestamp?: string, logLevel?: string, limit = 20, offset = 0) {
    return this.prisma.log.findMany({
      take: limit,
      skip: offset,
      where: {
        timestamp: {
          gte: timestamp,
        },
        logLevel: {
          equals: logLevel,
        },
      },
    });
  }

  async count(timestamp?: string, logLevel?: string) {
    return this.prisma.log.count({
      where: {
        timestamp: {
          gte: timestamp,
        },
        logLevel: {
          equals: logLevel,
        },
      },
    });
  }
}
