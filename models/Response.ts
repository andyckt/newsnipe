import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Define the response document interface
export interface IResponse {
  shortId: string;
  snipeId: mongoose.Types.ObjectId;
  snipeShortId: string;
  userId?: mongoose.Types.ObjectId; // Optional - if the user is authenticated
  personalDetails: {
    [key: string]: string | string[] | boolean;
  };
  recordings: Array<{
    questionId: string;
    recordingUrl?: string;
    recordingKey?: string;
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

// Create the schema
const responseSchema = new mongoose.Schema<IResponse>(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10), // Generate a short 10-character ID
    },
    snipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Snipe',
      required: true,
    },
    snipeShortId: {
      type: String,
      required: true,
      index: true, // Add index for faster queries
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    personalDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recordings: [{
      questionId: String,
      recordingUrl: String,
      recordingKey: String,
      duration: Number,
      transcription: String,
    }],
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    completedAt: Date,
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Response || mongoose.model<IResponse>('Response', responseSchema);
