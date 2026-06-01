let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch { /* nodemailer not installed */ }

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

exports.sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('Email not sent - SMTP not configured');
    return null;
  }
  try {
    const info = await transport.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'RSendix.pro'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email send error:', err.message);
    return null;
  }
};

exports.sendInvoiceEmail = async (invoice, userEmail) => {
  return this.sendEmail({
    to: userEmail,
    subject: `Invoice ${invoice.invoiceNumber} from RSendix.pro`,
    html: `
      <h2>Invoice #${invoice.invoiceNumber}</h2>
      <p>Amount: ${invoice.currency} ${invoice.amount}</p>
      <p>Status: ${invoice.status}</p>
      <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
    `
  });
};

exports.sendSubscriptionConfirmation = async (email, planName) => {
  return this.sendEmail({
    to: email,
    subject: `Subscription Activated - ${planName}`,
    html: `<h2>Welcome to ${planName} Plan!</h2><p>Your subscription is now active.</p>`
  });
};
