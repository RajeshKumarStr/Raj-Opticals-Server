import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🔧 Environment Variables Check:');
console.log('PORT:', process.env.PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('FOUNDER_EMAIL:', process.env.FOUNDER_EMAIL);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'NOT SET');

// Create transporter for nodemailer
const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 20000,
});

// Test email configuration with better logging
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration FAILED:');
    console.log('Error details:', error);
  } else {
    console.log('✅ Email configuration SUCCESSFUL');
    console.log('Server is ready to send emails');
  }
});

// Contact form endpoint with detailed logging
app.post('/api/contact', async (req, res) => {
  console.log('📨 Received contact form submission:', req.body);
  
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    console.log('📧 Preparing to send emails...');
    console.log('Founder email:', process.env.FOUNDER_EMAIL);
    console.log('Patient email:', email);

    // Email to founder
    const founderMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.FOUNDER_EMAIL,
      subject: `New Patient Inquiry - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; text-align: center;">NEW PATIENT INQUIRY RECEIVED</h2>
            <p style="margin: 5px 0 0 0; text-align: center; opacity: 0.9;">Auto-generated from Raj Opticals Website</p>
          </div>

          <div style="padding: 25px; background: #f8fafc;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📋 Patient Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 140px; background: #f8fafc;">Patient Name:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 16px; font-weight: bold; color: #1e40af;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: bold; background: #f8fafc;">Email Address:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">
                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: bold; background: #f8fafc;">Phone Number:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">
                    ${phone ? `
                      <a href="tel:${phone}" style="color: #059669; text-decoration: none; font-weight: bold;">${phone}</a>
                    ` : '<span style="color: #6b7280;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; background: #f8fafc;">Received At:</td>
                  <td style="padding: 12px; color: #7c3aed; font-weight: bold;">${timestamp} (IST)</td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">💬 Patient's Message</h3>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb;">
                <p style="margin: 0; line-height: 1.6; color: #374151; font-size: 15px;">
                  ${message.replace(/\n/g, '<br>')}
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    // Email to patient
    const patientMailOptions = {
      from: {
        name: "Raj Opticals",
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Thank You for Contacting Raj Opticals',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 25px 0; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Raj Opticals</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Eye Care & Optical Services</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="color: #2563eb; margin-top: 0; text-align: center;">Thank You for Your Inquiry!</h2>
            <p style="text-align: center; color: #374151;">
              We have received your message and will contact you shortly.
            </p>
          </div>
        </div>
      `
    };

    console.log('🔄 Attempting to send emails...');

    // Send both emails
    const results = await Promise.all([
      transporter.sendMail(founderMailOptions),
      transporter.sendMail(patientMailOptions)
    ]);

    console.log('✅ Emails sent successfully!');
    console.log('Founder email result:', results[0].response);
    console.log('Patient email result:', results[1].response);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully! We will contact you soon.' 
    });

  } catch (error) {
    console.error('❌ ERROR sending email:', error);
    
    let errorMessage = 'Failed to send email. Please try again later.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email configuration.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid email address. Please check your email and try again.';
    }

    console.log('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });

    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

// Test endpoint to check email configuration
app.get('/api/test-email', async (req, res) => {
  try {
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.FOUNDER_EMAIL,
      subject: 'Test Email from Raj Opticals Backend',
      text: 'This is a test email to verify your backend email configuration is working correctly.'
    };

    await transporter.sendMail(testMailOptions);
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ success: false, message: 'Test email failed: ' + error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Raj Opticals Backend is running!',
    timestamp: new Date().toISOString(),
    email_user: process.env.EMAIL_USER,
    founder_email: process.env.FOUNDER_EMAIL
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service ready for Raj Opticals`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test email: http://localhost:${PORT}/api/test-email`);
});