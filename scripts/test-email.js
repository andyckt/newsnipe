// Test script to verify email configuration
require('dotenv').config();

// Import the compiled JS version instead of the TypeScript file
// The path is relative to where the compiled JS will be located
const emailService = require('../dist/lib/email-service');
const { verifyEmailConfig, sendSubmissionNotification } = emailService;

async function testEmailService() {
  try {
    console.log('Verifying email configuration...');
    await verifyEmailConfig();
    console.log('Email configuration is valid!');
    
    // If you want to send a test email, uncomment the following lines
    // and replace the recipient email with your own
    /*
    console.log('Sending test email...');
    await sendSubmissionNotification(
      'your-email@example.com', // Replace with your email
      'Test Snipe',
      {
        personalDetails: { fullName: 'Test Candidate' },
        submissionId: 'test123',
        submissionDate: new Date(),
        numRecordings: 3
      }
    );
    console.log('Test email sent successfully!');
    */
    
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmailService();

// If running directly with node without compilation, uncomment this alternative approach:
/*
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
      to: 'your-email@example.com', // Replace with your email
      subject: 'Test Email from Snipe',
      html: '<h1>Test Email</h1><p>This is a test email from Snipe.</p>',
    });
    console.log('Test email sent successfully!');
    */
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

// testEmailDirectly();
*/
