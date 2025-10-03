import nodemailer from 'nodemailer';

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send an email notification for a new submission
 * 
 * @param to - Recipient email address
 * @param snipeTitle - Title of the snipe
 * @param submissionDetails - Details about the submission
 * @returns Promise that resolves when the email is sent
 */
export async function sendSubmissionNotification(
  to: string,
  snipeTitle: string,
  submissionDetails: {
    personalDetails?: Record<string, any>;
    submissionId: string;
    submissionDate: Date;
    numRecordings: number;
  }
) {
  const { personalDetails, submissionId, submissionDate, numRecordings } = submissionDetails;
  
  // Format the date nicely
  const formattedDate = new Date(submissionDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  // Extract name from personal details if available
  let candidateName = 'A candidate';
  if (personalDetails) {
    // Look for common name fields
    const nameFields = ['fullName', 'name', 'firstName', 'full_name', 'Full Name'];
    for (const field of nameFields) {
      if (personalDetails[field]) {
        candidateName = personalDetails[field];
        break;
      }
    }
  }

  // Create email content
  const subject = `New Submission for "${snipeTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1649ff; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Submission Received</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px; line-height: 1.5;">
          ${candidateName} has completed your snipe "${snipeTitle}".
        </p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Submission Details:</h3>
          <ul style="padding-left: 20px;">
            <li><strong>Submission ID:</strong> ${submissionId}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Recordings:</strong> ${numRecordings} completed</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">
          Log in to your Snipe dashboard to review this submission and make a decision.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://snipe.ai'}/submissions" 
             style="background-color: #1649ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Submission
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Snipe. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  // Send the email
  return transporter.sendMail({
    from: `"Snipe Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/**
 * Verify that the email service is properly configured
 * @returns Promise that resolves if the configuration is valid
 */
export async function verifyEmailConfig() {
  return transporter.verify();
}
