# Email Notifications for Snipe Submissions

This feature sends an email notification to the snipe creator whenever someone completes a submission.

## Configuration

The email service uses the following environment variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

For Gmail, you need to use an App Password rather than your regular account password. You can generate one at https://myaccount.google.com/apppasswords.

## Testing

You can test the email configuration using the provided test script:

```bash
node scripts/test-email.js
```

This will verify that your email configuration is valid. To send an actual test email, uncomment the relevant section in the script and replace the recipient email with your own.

## How It Works

1. When a submission is completed, the system looks up the snipe owner's email address
2. It sends a beautifully designed HTML email with details about the submission:
   - Snipe title
   - Submission ID
   - Submission date and time
   - Number of recordings
   - Candidate name (if available in personal details)
3. The email includes a direct link to the submissions page

## Email Design

The email features a modern design with:
- Rounded corners (16px border radius)
- Subtle gradient background in the header
- Clean typography with proper spacing
- A prominent call-to-action button with 50px border radius
- Subtle shadows for depth and modern feel
- Left border accent on the submission details section

## Troubleshooting

If emails are not being sent:

1. Check that the environment variables are set correctly
2. Verify that the Gmail account allows less secure apps or is using an App Password
3. Look for error logs in the server console
4. Try running the test script to diagnose issues

## Customization

The email template can be customized by modifying the `sendSubmissionNotification` function in `lib/email-service.ts`.
