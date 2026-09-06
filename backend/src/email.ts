export interface SendVerificationEmailParams {
  email: string;
  url: string;
  token: string;
}

export async function sendVerificationEmail({ email, url, token }: SendVerificationEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Email] RESEND_API_KEY not configured. Simulated verification email sent to ${email}`);
    console.log(`[Email] Verification URL: ${url}`);
    console.log(`[Email] Token: ${token}`);
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your CatTags account</title>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #080B12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F9FAFB;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #111827; border: 1px solid #1F2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
    <div style="padding: 28px 32px; border-bottom: 1px solid #1F2937; display: flex; align-items: center;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #3B82F6; letter-spacing: -0.5px;">
        🐱 CatTags
      </h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #F9FAFB;">
        Confirm your email address
      </h2>
      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #9CA3AF;">
        Thank you for creating an account on CatTags. To activate your Minecraft team management features, please verify your email address.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="background-color: #3B82F6; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
          Verify Email Address
        </a>
      </div>
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B7280; line-height: 1.5;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 24px; font-size: 12px; font-family: monospace; word-break: break-all; color: #60A5FA;">
        ${url}
      </p>
      <hr style="border: none; border-top: 1px solid #1F2937; margin: 24px 0;">
      <p style="margin: 0; font-size: 11px; color: #4B5563; line-height: 1.5;">
        If you didn't create an account with CatTags, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'CatTags <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your CatTags account',
        html
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Email] Resend API error (${res.status}):`, errorText);
    } else {
      console.log(`[Email] Verification email sent successfully to ${email}`);
    }
  } catch (err) {
    console.error('[Email] Failed to send verification email:', err);
  }
}
