const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📧 Contact form started...');
    const data = JSON.parse(event.body);
    console.log('📧 Received data:', data);
    
    // Simple validation
    if (!data.firstName || !data.lastName || !data.email || !data.message) {
      console.log('❌ Missing required fields');
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Please fill in all required fields: First Name, Last Name, Email, and Message' })
      };
    }

    // Create transporter (same as working test)
    console.log('📧 Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email to business
    console.log('📧 Sending business email...');
    const businessResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'mulambwanesafaris@gmail.com',
      subject: `Website Contact - ${data.firstName} ${data.lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Interest:</strong> ${data.interest || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.message}
        </div>
      `
    });

    console.log('✅ Business email sent:', businessResult.messageId);

    // Send confirmation to customer
    console.log('📧 Sending confirmation email...');
    const confirmationResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: 'Thank you for contacting Mulambwane Safaris',
      html: `
        <h2>Thank you, ${data.firstName}!</h2>
        <p>We received your message and will respond within 24 hours.</p>
        <h3>Your Message:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.message}
        </div>
        <p>Contact us: mulambwanesafaris@gmail.com | +27 73 342 6833</p>
      `
    });

    console.log('✅ Confirmation email sent:', confirmationResult.messageId);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Thank you! Your message has been sent successfully. Check your email for confirmation.'
      })
    };

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to send message: ' + error.message 
      })
    };
  }
};