import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  timestamp: Date;
  serviceName: string;
  logLevel: string;
  message: string;
  metadata: Record<string, any>;
}

const LogSchema = new Schema<ILog>({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  serviceName: {
    type: String,
    required: true,
  },
  logLevel: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'debug'],
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'logs'
});

LogSchema.index({ timestamp: -1, serviceName: 1 });
LogSchema.index({ timestamp: -1, logLevel: 1 });
LogSchema.index({ timestamp: -1, serviceName: 1, logLevel: 1 });

LogSchema.index({ timestamp: -1, serviceName: 1, logLevel: 1 });

LogSchema.index({ message: 'text' });

export const Log = mongoose.model<ILog>('Log', LogSchema); 