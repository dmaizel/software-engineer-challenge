import { AnyKeys, RootFilterQuery } from "mongoose";
import { Log, ILog } from "./Logs";
import { LogSearchQuery } from "./types";

export const createLog = async (log: AnyKeys<ILog>) => {
  return Log.create(log);
};

export const buildSearchQuery = (query: LogSearchQuery) => {
  const filterQuery: RootFilterQuery<ILog> = {};

  if (query.serviceName) {
    filterQuery.serviceName = { $regex: query.serviceName, $options: "i" };
  }

  if (query.message) {
    filterQuery.$text = { $search: query.message };
  }

  if (query.logLevel) {
    filterQuery.logLevel = query.logLevel;
  }

  if (query.startDate) {
    filterQuery.timestamp = {
      $gte: query.startDate,
    };
    if (query.endDate) {
      filterQuery.timestamp.$lte = query.endDate;
    }
  }

  return filterQuery;
};

export const getLogsCount = async (query: LogSearchQuery) => {
  const filterQuery = buildSearchQuery(query);
  return Log.countDocuments(filterQuery);
};

export const getLogs = async (
  query: LogSearchQuery,
  page: number,
  limit: number
) => {
  const filterQuery = buildSearchQuery(query);

  return Log.find(filterQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ timestamp: -1 })
    .lean();
};
