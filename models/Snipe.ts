import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Define interfaces for the TextInput type
interface TextInput {
  id: string;
  value: string;
  audioUrl?: string;
  audioKey?: string;
  isGenerating?: boolean;
  timeLimit?: string;
}

// Define interface for PersonalDetailField
interface PersonalDetailField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  dropdownOptions?: string[];
  allowMultiple?: boolean;
}

// Define interface for PersonalDetailsConfig
interface PersonalDetailsConfig {
  includePersonalDetails: boolean;
  personalFields: PersonalDetailField[];
}

// Define the Snipe document interface
export interface ISnipe {
  shortId: string;
  title: string;    // Title for the snipe configuration
  submissions: number; // Number of submissions for this snipe
  userId: mongoose.Types.ObjectId;
  numRecordings: number;
  audioLanguage: string;
  textInputs: TextInput[];
  mode: string;
  timeLimit: string;
  personalDetailsConfig: PersonalDetailsConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const snipeSchema = new mongoose.Schema<ISnipe>(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10), // Generate a short 10-character ID
    },

    title: {
      type: String,
      default: "Untitled Snipe",
    },
    submissions: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    numRecordings: {
      type: Number,
      required: true,
    },
    audioLanguage: {
      type: String,
      required: true,
      enum: ['english', 'mandarin'],
    },
    textInputs: [{
      id: String,
      value: String,
      audioUrl: String,
      audioKey: String,
      isGenerating: Boolean,
      timeLimit: String,
    }],
    mode: {
      type: String,
      required: true,
      enum: ['question', 'conversation'],
    },
    timeLimit: {
      type: String,
      required: true,
      default: 'no_limit',
    },
    personalDetailsConfig: {
      includePersonalDetails: {
        type: Boolean,
        default: false,
      },
      personalFields: [{
        id: String,
        label: String,
        type: {
          type: String,
          enum: ['text', 'dropdown', 'checkbox'],
        },
        required: Boolean,
        dropdownOptions: [String],
        allowMultiple: Boolean,
      }],
    },
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Snipe || mongoose.model<ISnipe>('Snipe', snipeSchema);
