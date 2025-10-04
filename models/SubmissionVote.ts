import mongoose from 'mongoose';

// Define the submission vote document interface
export interface ISubmissionVote {
  submissionId: string;        // ID of the submission being voted on
  userId: mongoose.Types.ObjectId; // User who made the vote
  voteType: 'up' | 'down';     // Type of vote (up or down)
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const submissionVoteSchema = new mongoose.Schema<ISubmissionVote>(
  {
    submissionId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    voteType: {
      type: String,
      enum: ['up', 'down'],
      required: true
    }
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only have one vote per submission
submissionVoteSchema.index({ submissionId: 1, userId: 1 }, { unique: true });

// Create and export the model
export default mongoose.models.SubmissionVote || mongoose.model<ISubmissionVote>('SubmissionVote', submissionVoteSchema);
