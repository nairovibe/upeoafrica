import { company } from "@/lib/content";

const LOGO = `${company.domain}/email-logo.png`;
const FONT = "Arial,Helvetica,sans-serif";
export const EMAIL_OTP_MINUTES = 60;
export const EMAIL_FOOTER_ADDRESS = "88225, Moi Avenue, Mombasa 80100";

export function emailFooterHtml(sentTo?: string) {
  const recipient = sentTo
    ? `This message was sent to ${sentTo}. If you did not request it, you can ignore this email.`
    : "If you did not request this email, you can ignore it.";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="120" style="width:120px;margin:0 auto 20px;border-collapse:collapse">
        <tr><td style="border-top:1px solid #e6e8ee;font-size:0;line-height:0;height:1px">&nbsp;</td></tr>
      </table>
      <p style="margin:0 0 6px;font-family:${FONT};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7583">Upeo Africa Technologies Ltd</p>
      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',Times,serif;font-size:11px;letter-spacing:0.02em;line-height:1.6;color:#8a93a0">${EMAIL_FOOTER_ADDRESS}</p>
      <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;line-height:1.7;color:#8a93a0">${recipient}</p>
      <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.7;color:#8a93a0">Please do not reply. &copy; 2026 · <a href="${company.domain}" style="color:#8a93a0;text-decoration:none">${company.domain.replace("https://", "")}</a></p>`;
}

export function brandedEmailHtml(opts: {
  preview: string;
  heading: string;
  body: string;
  code?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  sentTo?: string;
}) {
  const codeBlock = opts.code
    ? `<p style="margin:28px 0 8px;font-family:Georgia,Times,serif;font-size:32px;line-height:1.2;letter-spacing:0.22em;color:#0b0e14;font-weight:700">${opts.code}</p>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;line-height:1.7;color:#414b5a">It expires in ${EMAIL_OTP_MINUTES} minutes.</p>`
    : "";

  const button = opts.buttonUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;border-collapse:collapse">
        <tr>
          <td style="background:#f97316">
            <a href="${opts.buttonUrl}" style="display:inline-block;padding:14px 22px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none">${opts.buttonLabel || "Continue"}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;width:100%">
  <div style="display:none;max-height:0;overflow:hidden">${opts.preview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;border-collapse:collapse">
    <tr>
      <td style="background:#ffffff;padding:28px 6% 0">
        <img src="${LOGO}" alt="Upeo Africa Technologies" width="176" height="48" style="display:block;border:0;outline:none;height:48px;width:auto;max-width:220px" />
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:32px 6% 8px">
        <h1 style="margin:0 0 16px;font-family:${FONT};font-size:24px;line-height:1.3;color:#0b0e14;font-weight:700">${opts.heading}</h1>
        <p style="margin:0 0 8px;font-family:${FONT};font-size:15px;line-height:1.7;color:#414b5a">${opts.body}</p>
        ${codeBlock}
        ${button}
      </td>
    </tr>
    <tr>
      <td align="center" style="background:#ffffff;padding:28px 6% 40px">${emailFooterHtml(opts.sentTo)}</td>
    </tr>
  </table>
</body>
</html>`;
}

export const RESEND_FROM =
  process.env.RESEND_FROM ||
  "Upeo Africa Technologies <noreply@upeoafricatechnologies.co.ke>";
