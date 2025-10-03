// Direct test script that doesn't rely on TypeScript imports
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailDirectly() {
  try {
    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
    
    console.log('Verifying email configuration...');
    await transporter.verify();
    console.log('Email configuration is valid!');
    
    // Uncomment to send a test email
    /*
    console.log('Sending test email...');
    await transporter.sendMail({
      from: `"Snipe Notifications" <${process.env.EMAIL_USER}>`,
      to: 'your-email@example.com', // Replace with your email address here
      subject: 'Test Email from Snipe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1649ff; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Test Email from Snipe</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; line-height: 1.5;">
              This is a test email to verify that the email notification system is working correctly.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Email Details:</h3>
              <ul style="padding-left: 20px;">
                <li><strong>Sent:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Snipe. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log('Test email sent successfully!');
    */
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmailDirectly();
