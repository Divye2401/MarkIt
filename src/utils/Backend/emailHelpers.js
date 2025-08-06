// markit/src/utils/Backend/emailHelpers.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailToUser(email, bookmarkId) {
  try {
    const data = await resend.emails.send({
      from: "Markit App <noreply@resend.dev>", // Use a verified sender from Resend
      to: email,
      subject: "You've been invited to a shared bookmark!",
      html: `<p>Click the following link to join the bookmark: ${process.env.NEXT_PUBLIC_APP_URL}/bookmark/${bookmarkId}</p>`,
    });
    return data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
