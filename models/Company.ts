import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import bcrypt from 'bcryptjs';

// Create a custom nanoid generator for 6-digit numeric codes
const generateCompanyCode = customAlphabet('0123456789', 6);

// Define the company document interface
export interface ICompany {
  companyCode: string;        // 6-digit unique company code
  name: string;               // Company name
  passcode: string;           // Hashed passcode for joining
  creatorId: mongoose.Types.ObjectId; // User who created the company
  members: mongoose.Types.ObjectId[]; // Array of user IDs who are members
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyMethods {
  comparePasscode(candidatePasscode: string): Promise<boolean>;
}

export type CompanyModel = mongoose.Model<ICompany, {}, ICompanyMethods>;

// Create the schema
const companySchema = new mongoose.Schema<ICompany, CompanyModel, ICompanyMethods>(
  {
    companyCode: {
      type: String,
      required: true,
      unique: true,
      // No default value - will be provided from the frontend
    },
    name: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    passcode: {
      type: String,
      required: [true, 'Please provide a passcode'],
      minlength: [6, 'Passcode must be at least 6 characters'],
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

// Hash the passcode before saving
companySchema.pre('save', async function (next) {
  // Only hash the passcode if it has been modified (or is new)
  if (!this.isModified('passcode')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the passcode using the salt
    this.passcode = await bcrypt.hash(this.passcode, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passcode for joining
companySchema.methods.comparePasscode = async function (candidatePasscode: string) {
  return bcrypt.compare(candidatePasscode, this.passcode);
};

// Create and export the model
export default mongoose.models.Company || mongoose.model<ICompany, CompanyModel>('Company', companySchema);
