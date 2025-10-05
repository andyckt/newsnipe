import mongoose from 'mongoose';

// Define the submission comment document interface
export interface ISubmissionComment {
  submissionId: string;        // ID of the submission being commented on
  userId: mongoose.Types.ObjectId; // User who made the comment
  text: string;                // Comment text
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const submissionCommentSchema = new mongoose.Schema<ISubmissionComment>(
  {
    submissionId: {
      type: String,
      required: true,
      index: true // Add index for faster queries
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    }
  },
  { timestamps: true }
);

// Create index for faster queries by submissionId
submissionCommentSchema.index({ submissionId: 1, createdAt: 1 });

// Create and export the model
export default mongoose.models.SubmissionComment || 
  mongoose.model<ISubmissionComment>('SubmissionComment', submissionCommentSchema);
