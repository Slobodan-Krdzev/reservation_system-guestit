"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReservationCancellationEmail = exports.sendReservationApprovalEmail = exports.sendVerificationEmail = exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
exports.mailer = nodemailer_1.default.createTransport({
    host: env_1.env.smtpHost,
    port: env_1.env.smtpPort,
    secure: env_1.env.smtpPort === 465,
    auth: {
        user: env_1.env.smtpUser,
        pass: env_1.env.smtpPass,
    },
});
const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${env_1.env.frontendUrl}/auth/verify?token=${token}`;
    const clientLogoUrl = `${env_1.env.frontendUrl}/client.png`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Account</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#010101;background-image:url('${env_1.env.frontendUrl}/bg.png');background-size:cover;background-position:center;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:rgba(1,1,1,0.95);">
    <tr>
      <td align="center" style="padding:60px 20px;">
        <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#1a1a1a;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding:40px 30px 30px;background:linear-gradient(135deg,#1a1a1a 0%,#0f0f0f 100%);">
              <img src="${clientLogoUrl}" alt="Client Logo" style="max-width:200px;height:auto;display:block;" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.4em;text-transform:uppercase;color:#c0c0c0;text-align:center;">
                Welcome
              </p>
              <h1 style="margin:0 0 20px;font-size:32px;font-weight:600;color:#ffffff;text-align:center;">
                Activate your account
              </h1>
              <p style="margin:0 0 30px;font-size:16px;line-height:1.6;color:#e0e0e0;text-align:center;">
                Complete your registration to unlock the reservation dashboard.
              </p>
              <table role="presentation" align="center" style="margin:0 auto 30px;border-collapse:collapse;">
                <tr>
                  <td>
                    <a href="${verifyUrl}" style="display:inline-block;padding:16px 32px;border-radius:999px;background:#ffffff;color:#000000;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:0.2em;">
                      Verify email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;color:#7f7f7f;text-align:center;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#ffffff;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;background-color:#0f0f0f;text-align:center;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;font-size:12px;color:#666666;">
                This email was intended for ${email}. If you didn't create an account, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    const text = `Welcome! Please verify your account by visiting: ${verifyUrl}`;
    const message = {
        from: env_1.env.smtpFromEmail,
        to: email,
        subject: 'Verify your Reservation System account',
        text,
        html,
    };
    try {
        await exports.mailer.sendMail(message);
    }
    catch (error) {
        // For development, log the URL even if mail fails
        // eslint-disable-next-line no-console
        console.warn('Failed to send verification email via SMTP, logging verification URL instead:', verifyUrl);
    }
    // Always log token for development
    // eslint-disable-next-line no-console
    console.log(`Verification token for ${email}: ${verifyUrl}`);
};
exports.sendVerificationEmail = sendVerificationEmail;
const formatDate = (dateString) => {
    // Parse YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatTime = (timeSlot) => {
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};
const sendReservationApprovalEmail = async (email, data) => {
    const clientLogoUrl = `${env_1.env.frontendUrl}/client.png`;
    const formattedDate = formatDate(data.date);
    const formattedTime = formatTime(data.timeSlot);
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #010101; background-image: url('${env_1.env.frontendUrl}/bg.png'); background-size: cover; background-position: center;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(1, 1, 1, 0.95);">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 30px 30px; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);">
              <img src="${clientLogoUrl}" alt="Client Logo" style="max-width: 200px; height: auto; display: block;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #1a1a1a;">
              <h1 style="margin: 0 0 20px; font-size: 32px; font-weight: 600; color: #ffffff; text-align: center;">
                Reservation Approved! 🎉
              </h1>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Hi ${data.firstName} ${data.lastName},
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Great news! Your reservation has been confirmed.
              </p>
              
              <!-- Reservation Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #292929; border-radius: 16px; padding: 30px; margin: 30px 0;">
                <tr>
                  <td style="padding: 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr >
                        <td style="padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">
                            Table
                          </p>
                          <p style="margin: 8px 0 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                            ${data.tableName}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px ; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">
                            Date & Time
                          </p>
                          <p style="margin: 8px 0 0; font-size: 20px; font-weight: 500; color: #ffffff;">
                            ${formattedDate} at ${formattedTime}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px ;">
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">
                            Guests
                          </p>
                          <p style="margin: 8px 0 0; font-size: 20px; font-weight: 500; color: #ffffff;">
                            ${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #a0a0a0; text-align: center;">
                We look forward to welcoming you!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0f0f0f; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #666666;">
                This is an automated confirmation email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    const text = `
Reservation Approved!

Hi ${data.firstName} ${data.lastName},

Great news! Your reservation has been confirmed.

Reservation Details:
- Table: ${data.tableName}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Guests: ${data.guests}

We look forward to welcoming you!
  `;
    const message = {
        from: env_1.env.smtpFromEmail,
        to: email,
        subject: 'Your Reservation Has Been Approved',
        text,
        html,
    };
    try {
        await exports.mailer.sendMail(message);
        // eslint-disable-next-line no-console
        console.log(`Approval email sent to ${email} for reservation at ${data.tableName}`);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send approval email:', error);
        throw error;
    }
};
exports.sendReservationApprovalEmail = sendReservationApprovalEmail;
const sendReservationCancellationEmail = async (email, data) => {
    const clientLogoUrl = `${env_1.env.frontendUrl}/client.png`;
    const formattedDate = formatDate(data.date);
    const formattedTime = formatTime(data.timeSlot);
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #010101; background-image: url('${env_1.env.frontendUrl}/bg.png'); background-size: cover; background-position: center;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: rgba(1, 1, 1, 0.95);">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          <tr>
            <td align="center" style="padding: 40px 30px 30px; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);">
              <img src="${clientLogoUrl}" alt="Client Logo" style="max-width: 200px; height: auto; display: block;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; background-color: #1a1a1a;">
              <h1 style="margin: 0 0 20px; font-size: 32px; font-weight: 600; color: #ffffff; text-align: center;">
                Reservation Cancelled
              </h1>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Hi ${data.firstName} ${data.lastName},
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Your reservation for ${formattedDate} at ${formattedTime} has been cancelled as requested.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #292929; border-radius: 16px; padding: 30px; margin: 30px 0;">
                <tr>
                  <td style="padding: 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">Table</p>
                          <p style="margin: 8px 0 0; font-size: 24px; font-weight: 600; color: #ffffff;">${data.tableName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">Date & Time</p>
                          <p style="margin: 8px 0 0; font-size: 20px; font-weight: 500; color: #ffffff;">${formattedDate} at ${formattedTime}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">Guests</p>
                          <p style="margin: 8px 0 0; font-size: 20px; font-weight: 500; color: #ffffff;">${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #a0a0a0; text-align: center;">
                We hope to host you again soon. Let us know if you'd like to rebook another time.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #0f0f0f; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #666666;">
                This is an automated message to confirm your cancellation.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    const text = `
Reservation Cancelled

Hi ${data.firstName} ${data.lastName},

Your reservation for ${formattedDate} at ${formattedTime} has been cancelled as requested.

Details:
- Table: ${data.tableName}
- Guests: ${data.guests}

We hope to host you again soon.
  `;
    const message = {
        from: env_1.env.smtpFromEmail,
        to: email,
        subject: 'Your Reservation Has Been Cancelled',
        text,
        html,
    };
    try {
        await exports.mailer.sendMail(message);
        // eslint-disable-next-line no-console
        console.log(`Cancellation email sent to ${email} for reservation at ${data.tableName}`);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send cancellation email:', error);
    }
};
exports.sendReservationCancellationEmail = sendReservationCancellationEmail;
//# sourceMappingURL=mailer.js.map