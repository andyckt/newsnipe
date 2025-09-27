import mongoose from 'mongoose';

// Define the response decision document interface
export interface IResponseDecision {
  responseId: string;          // The shortId of the response
  userId: mongoose.Types.ObjectId; // The admin who made the decision
  decision: 'like' | 'potential' | 'reject'; // The decision type
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const responseDecisionSchema = new mongoose.Schema<IResponseDecision>(
  {
    responseId: {
      type: String,
      required: true,
      index: true, // Add index for faster queries
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decision: {
      type: String,
      enum: ['like', 'potential', 'reject'],
      required: true,
    },
  },
  { 
    timestamps: true,
    // Create a compound index for fast lookups by responseId and userId
    // This also ensures a user can only have one decision per response
    indexes: [
      { 
        fields: { responseId: 1, userId: 1 },
        unique: true
      }
    ]
  }
);

// Create and export the model
export default mongoose.models.ResponseDecision || 
  mongoose.model<IResponseDecision>('ResponseDecision', responseDecisionSchema);
