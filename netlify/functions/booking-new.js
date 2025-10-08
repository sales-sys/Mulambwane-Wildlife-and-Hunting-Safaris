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
    const data = JSON.parse(event.body);
    console.log('Received booking data:', data);

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.checkIn || !data.checkOut || !data.adults) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: firstName, lastName, email, checkIn, checkOut, adults' })
      };
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email credentials');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log('Email credentials found, creating transporter...');

    // Create Gmail transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Simple booking email to business
    const businessEmail = {
      from: process.env.EMAIL_USER,
      to: 'mulambwanesafaris@gmail.com',
      subject: `New Lodge Booking Request - ${data.firstName} ${data.lastName}`,
      text: `
NEW LODGE BOOKING REQUEST
========================

Guest Information:
• Name: ${data.firstName} ${data.lastName}
• Email: ${data.email}
• Phone: ${data.phone || 'Not provided'}

Booking Details:
• Check-in: ${data.checkIn}
• Check-out: ${data.checkOut}
• Adults: ${data.adults}
• Children: ${data.children || '0'}
• Suite Preference: ${data.suite || 'Not specified'}

Special Requests:
${data.specialRequests || 'None'}

---
Sent from Mulambwane Safari Website
Lodge Booking System
      `
    };

    console.log('Sending booking email...');
    const result = await transporter.sendMail(businessEmail);
    console.log('Booking email sent successfully:', result.messageId);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Booking request sent successfully! We will contact you within 24 hours.',
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to send booking request: ' + error.message 
      })
    };
  }
};