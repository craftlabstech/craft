import { Resend } from 'resend';
import { emailServiceBreaker, ExternalServiceError } from './api-error-handler';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Get disposable email domains from environment variable or return default list
 * Environment variable: DISPOSABLE_EMAIL_DOMAINS (comma-separated list)
 */
function getDisposableEmailDomains(): string[] {
  const envDomains = process.env.DISPOSABLE_EMAIL_DOMAINS;

  if (envDomains) {
    return envDomains.split(',').map(domain => domain.trim().toLowerCase());
  }

  // Default disposable email domains
  return [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ];
}

export async function sendOTPEmail(email: string, url: string, emailType: 'signin' | 'password-reset' = 'signin') {
  try {
    // Validate inputs
    if (!email || !url) {
      throw new Error('Email and URL are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Use circuit breaker for email service
    await emailServiceBreaker.execute(async () => {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'support@resend.dev',
        to: email,
        subject: emailType === 'password-reset' ? 'Reset your password' : 'Sign in to Craft',
        html: generateEmailTemplate(url, emailType),
      });

      if (!result.data?.id) {
        throw new ExternalServiceError('Failed to send email - no confirmation received');
      }

      return result;
    });

    console.log(`${emailType === 'password-reset' ? 'Password reset' : 'Verification'} email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    // Handle specific Resend API errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as { message: string }).message;

      if (errorMessage.includes('rate limit')) {
        throw new ExternalServiceError('Email rate limit exceeded. Please try again later.');
      }

      if (errorMessage.includes('invalid email')) {
        throw new ExternalServiceError('Invalid email address provided.');
      }

      if (errorMessage.includes('api key')) {
        throw new ExternalServiceError('Email service configuration error.');
      }
    }

    throw new ExternalServiceError('Failed to send verification email. Please try again.');
  }
}

function generateEmailTemplate(url: string, emailType: 'signin' | 'password-reset' = 'signin'): string {
  const isPasswordReset = emailType === 'password-reset';

  return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">Craft</h1>
            </div>

            <!-- Main Content -->
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px;">
                <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">
                  ${isPasswordReset ? 'Reset your password' : 'Sign in to your account'}
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                    ${isPasswordReset
      ? 'Click the button below to reset your password. This link will expire in 1 hour for security.'
      : 'Click the button below to securely sign in to your Craft account:'
    }
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; font-size: 16px;">
                        ${isPasswordReset ? 'Reset Password' : 'Sign in to Craft'}
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.4; margin: 24px 0 0 0;">
                    Or copy and paste this URL into your browser:<br>
                    <a href="${url}" style="color: #3b82f6; word-break: break-all;">${url}</a>
                </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.4; margin: 0;">
                    <strong>Security Notice:</strong><br>
                    ${isPasswordReset
      ? '• This password reset link will expire in 1 hour for your security<br>• If you didn\'t request this password reset, you can safely ignore this email<br>• Never share this link with anyone else'
      : '• This link will expire in 24 hours for your security<br>• If you didn\'t request this email, you can safely ignore it<br>• Never share this link with anyone else'
    }
                </p>
                
                <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">
                    This email was sent to you because ${isPasswordReset ? 'a password reset was requested' : 'a sign-in was requested'} for your Craft account. If you have any questions, please contact our support team.
                </p>
            </div>
        </div>
    `;
}

// Helper function to validate email deliverability
export async function validateEmailDeliverability(email: string): Promise<boolean> {
  try {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check for common disposable email domains
    const disposableEmailDomains = getDisposableEmailDomains();

    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      console.warn(`Disposable email domain detected: ${domain}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
}

// Retry mechanism for failed emails
export async function sendEmailWithRetry(
  email: string,
  url: string,
  maxRetries: number = 3,
  delay: number = 1000,
  emailType: 'signin' | 'password-reset' = 'signin'
): Promise<void> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendOTPEmail(email, url, emailType);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      console.error(`Email send attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}
