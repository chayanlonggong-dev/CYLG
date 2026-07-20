export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const sentEmails: EmailMessage[] = [];

export async function sendEmail(
  message: EmailMessage
): Promise<EmailResult> {
  try {
    /*
      目前為開發模式。
      後續接入 SMTP / Resend / SendGrid 時，
      在這裡替換實際發送邏輯。
    */

    sentEmails.push(message);

    console.log(
      "[EMAIL SENT]",
      {
        to: message.to,
        subject: message.subject,
      }
    );

    return {
      success: true,
      messageId:
        Date.now().toString(),
    };

  } catch (error) {
    console.error(
      "Email sending failed:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

export function getSentEmails() {
  return [...sentEmails];
}

export function clearSentEmails() {
  sentEmails.length = 0;
}

export function createEmailTemplate(
  title: string,
  content: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
</head>

<body style="font-family: Arial, sans-serif;">
<h1>${title}</h1>

<p>
${content}
</p>

</body>
</html>
`;
}