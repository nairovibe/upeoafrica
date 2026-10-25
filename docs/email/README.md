# Studio desk email (Supabase + Resend)

Paste each HTML file into **Supabase → Authentication → Email Templates**. Keep the `{{ .Token }}`, `{{ .ConfirmationURL }}`, and `{{ .Data.first_name }}` placeholders exactly as written.

The body says the code expires in 60 minutes. In **Authentication → Settings**, set Mailer OTP Expiration to `3600` so that matches. Mailer OTP length must be `8` so the desk input and the email agree.

| Supabase template | File | Subject line |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | Confirm your email |
| Reset password | `reset-password.html` | Reset your password |
| Magic link | `magic-link.html` | Your sign-in code |
| Invite user | `invite.html` | You have been invited |
| Change email address | `change-email.html` | Confirm your new email |

## Resend SMTP (Auth emails)

In **Resend**: add and verify the domain `upeoafricatechnologies.co.ke`, then create an API key.

In **Supabase → Project Settings → Authentication → SMTP**:

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the Resend API key
- Sender email: `noreply@upeoafricatechnologies.co.ke`
- Sender name: `Upeo Africa Technologies`

## Auth settings that must be on

In **Authentication → Providers → Email**:

- Confirm email: **on**
- Secure email change: **on**

In **Authentication → URL Configuration**:

- Site URL: `https://upeoafricatechnologies.co.ke`
- Redirect URLs:
  - `https://upeoafricatechnologies.co.ke/admin/login`
  - `http://localhost:3000/admin/login`

In **Authentication → Bot and Abuse Protection** (or Captcha):

- Provider: Cloudflare Turnstile
- Add the site key and secret in the Supabase captcha settings
- Put the same site key in Next.js as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Put the same secret in Next.js as `TURNSTILE_SECRET_KEY` (server only)

The Turnstile secret in Supabase only covers Auth. Contact, enquiry, checkout, and a second login check verify on the Next.js server.

The Next.js host also needs `RESEND_API_KEY` so lead receipts send from `noreply@upeoafricatechnologies.co.ke`.
