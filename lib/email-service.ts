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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #1649ff; background-image: linear-gradient(135deg, #1649ff, #3a66ff); padding: 30px 20px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; margin: 0; font-weight: 600; letter-spacing: -0.5px;">New Submission Received</h1>
      </div>
      
      <div style="padding: 30px; background-color: white; border-radius: 0 0 16px 16px;">
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px;">
          ${candidateName} has completed your snipe "<strong>${snipeTitle}</strong>".
        </p>
        
        <div style="background-color: #f5f9ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #1649ff;">
          <h3 style="margin-top: 0; color: #1649ff; font-weight: 600;">Submission Details</h3>
          <ul style="padding-left: 20px; color: #444;">
            <li style="margin-bottom: 8px;"><strong>Submission ID:</strong> ${submissionId}</li>
            <li style="margin-bottom: 8px;"><strong>Date:</strong> ${formattedDate}</li>
            <li style="margin-bottom: 0;"><strong>Recordings:</strong> ${numRecordings} completed</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px;">
          Log in to your Snipe dashboard to review this submission and make a decision.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://thesnipe.co" 
             style="background-color: #1649ff; background-image: linear-gradient(135deg, #1649ff, #3a66ff); color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(22, 73, 255, 0.25);">
            View Submission
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #888; font-size: 12px; background-color: #f9f9f9; border-top: 1px solid #eee;">
        <p style="margin: 5px 0;">© ${new Date().getFullYear()} Snipe. All rights reserved.</p>
        <p style="margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
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
