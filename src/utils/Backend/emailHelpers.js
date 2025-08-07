// markit/src/utils/Backend/emailHelpers.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailToUser(email, Id, type) {
  let html = "";
  if (type === "bookmark") {
    html = `<p>You have been added to a shared bookmark: ${process.env.NEXT_PUBLIC_URL}/bookmark/${Id}</p>`;
  } else if (type === "folder") {
    html = `<p>You have been added to a shared folder: ${process.env.NEXT_PUBLIC_URL}/folder/${Id}</p>`;
  } else {
    throw new Error("Invalid type");
  }

  try {
    const data = await resend.emails.send({
      from: "Markit App <noreply@resend.dev>", // Use a verified sender from Resend
      to: email,
      subject: "You've been invited to a shared Link!",
      html: html,
    });
    return data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
