const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const templates = {
  recommendation: (userName, skillNames) => ({
    subject: '🤖 New Skills Recommended For You!',
    html: `<div style="font-family:sans-serif;padding:24px;">
      <h2>Hey ${userName}! 👋</h2>
      <p>We found new skills matching your interests:</p>
      <ul>${skillNames.map((s) => `<li><b>${s}</b></li>`).join('')}</ul>
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">View Dashboard</a>
    </div>`,
  }),
  roadmap_progress: (userName, skillName, pct) => ({
    subject: `🗺️ You're ${pct}% through your ${skillName} Roadmap!`,
    html: `<div style="font-family:sans-serif;padding:24px;">
      <h2>Great progress, ${userName}! 🎉</h2>
      <p>You've completed <b>${pct}%</b> of your <b>${skillName}</b> roadmap.</p>
      <a href="${process.env.CLIENT_URL}/roadmap" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Continue Learning</a>
    </div>`,
  }),
  admin_announcement: (userName, title, message) => ({
    subject: `📢 ${title}`,
    html: `<div style="font-family:sans-serif;padding:24px;">
      <h2>Hi ${userName}! 📢</h2>
      <h3>${title}</h3>
      <p>${message}</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Go to Dashboard</a>
    </div>`,
  }),
};

async function sendEmail(to, type, ...args) {
  try {
    const template = templates[type](...args);
    await transporter.sendMail({
      from: `"SkillApp" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

module.exports = { sendEmail };