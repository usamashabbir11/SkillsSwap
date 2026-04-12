import nodemailer from "nodemailer";

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

const header = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#4F46E5;padding:20px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">SkillsSwap</h1>
    </div>
    <div style="padding:30px;background:#f9f9f9;">
`;

const footer = `
    </div>
    <div style="background:#e5e7eb;padding:12px;text-align:center;font-size:12px;color:#6b7280;">
      &copy; ${new Date().getFullYear()} SkillsSwap. All rights reserved.
    </div>
  </div>
`;

const send = async (to, subject, body) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"SkillsSwap" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `${header}${body}${footer}`
    });
  } catch (_err) {
    // Fail silently — never crash the server
  }
};

const p = (text) =>
  `<p style="font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;

/* ===================== EMAIL FUNCTIONS ===================== */

export const sendWelcomeEmail = (to, name) =>
  send(
    to,
    "Welcome to SkillsSwap!",
    p(`Hi <strong>${name}</strong>,`) +
      p("Welcome to <strong>SkillsSwap</strong>! We're excited to have you. Start browsing skills, connect with other learners, and begin swapping today.")
  );

export const sendSwapRequestEmail = (to, senderName) =>
  send(
    to,
    "New Skill Swap Request",
    p("You have a new skill swap request!") +
      p(`<strong>${senderName}</strong> has sent you a skill swap request. Log in to review and respond.`)
  );

export const sendSwapAcceptedEmail = (to, receiverName) =>
  send(
    to,
    "Your Swap Request Was Accepted",
    p(`<strong>${receiverName}</strong> accepted your skill swap request.`) +
      p("Head over to SkillsSwap to select a course and get started!")
  );

export const sendSwapRejectedEmail = (to, receiverName) =>
  send(
    to,
    "Your Swap Request Was Rejected",
    p(`<strong>${receiverName}</strong> rejected your skill swap request.`) +
      p("Don't worry — there are many other users to connect with on SkillsSwap.")
  );

export const sendCourseSelectedEmail = (to, selectorName, courseTitle) =>
  send(
    to,
    "A Course Was Selected in Your Swap",
    p(`<strong>${selectorName}</strong> selected your course <strong>"${courseTitle}"</strong> in a swap deal.`) +
      p("Log in to SkillsSwap to view the deal details.")
  );

export const sendCoursePurchasedBuyerEmail = (to, courseTitle, ownerName) =>
  send(
    to,
    "Course Purchase Successful",
    p(`You successfully purchased <strong>"${courseTitle}"</strong> by <strong>${ownerName}</strong>.`) +
      p("Log in to SkillsSwap to access your course.")
  );

export const sendCoursePurchasedOwnerEmail = (to, buyerName, courseTitle) =>
  send(
    to,
    "Your Course Was Purchased",
    p(`<strong>${buyerName}</strong> purchased your course <strong>"${courseTitle}"</strong>.`) +
      p("Great news! Check your SkillsSwap account for more details.")
  );

export const sendReviewReceivedEmail = (to, reviewerName, rating) =>
  send(
    to,
    "You Received a New Review",
    p(`<strong>${reviewerName}</strong> left you a <strong>${rating} star</strong> review.`) +
      p("Log in to SkillsSwap to see what they said.")
  );

export const sendAccountDeletedEmail = (to, name) =>
  send(
    to,
    "Your SkillsSwap Account Has Been Deleted",
    p(`Hi <strong>${name}</strong>,`) +
      p("Your SkillsSwap account has been successfully deleted. All your data has been removed from our platform.") +
      p("We're sorry to see you go. You're always welcome to create a new account in the future.")
  );
