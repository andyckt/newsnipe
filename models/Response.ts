import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

export interface IResponse {
  shortId: string;
  snipeShortId: string;
  userId?: mongoose.Types.ObjectId;
  personalDetails: { [key: string]: string | string[] | boolean; };
  recordings: Array<{
    questionId: string;
    recordingIndex: number;
    videoKey?: string;
    videoUrl?: string;
    thumbnailKey?: string;
    thumbnailUrl?: string;
    duration?: number;
    transcription?: string;
  }>;
  ipAddress?: string;
  userAgent?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new mongoose.Schema<IResponse>(
  {
    shortId: { 
      type: String, 
      required: true, 
      unique: true, 
      default: () => nanoid(10),
    },
    snipeShortId: { 
      type: String, 
      required: true,
      index: true
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      index: true
    },
    personalDetails: {
      type: Object,
      default: {}
    },
    recordings: [{
      questionId: String,
      recordingIndex: Number,
      videoKey: String,
      videoUrl: String,
      thumbnailKey: String,
      thumbnailUrl: String,
      duration: Number,
      transcription: String,
    }],
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress'
    },
    completedAt: Date
  }, 
  { timestamps: true }
);

// Use existing model if it exists, or create a new one
export const Response = mongoose.models.Response || mongoose.model<IResponse>('Response', responseSchema);