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
    console.log('🏨 Booking form started...');
    const data = JSON.parse(event.body);
    console.log('🏨 Received data:', data);
    
    // Simple validation
    if (!data.firstName || !data.lastName || !data.email || !data.checkIn || !data.checkOut || !data.adults) {
      console.log('❌ Missing required fields');
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Please fill in all required fields: First Name, Last Name, Email, Check-in Date, Check-out Date, and Number of Adults' })
      };
    }

    // Create transporter (same as working test)
    console.log('🏨 Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email to business
    console.log('🏨 Sending business email...');
    const businessResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'mulambwanesafaris@gmail.com',
      subject: `Lodge Booking - ${data.firstName} ${data.lastName}`,
      html: `
        <h2>New Lodge Booking Request</h2>
        <h3>Guest Information</h3>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        
        <h3>Booking Details</h3>
        <p><strong>Check-in:</strong> ${data.checkIn}</p>
        <p><strong>Check-out:</strong> ${data.checkOut}</p>
        <p><strong>Adults:</strong> ${data.adults}</p>
        <p><strong>Children:</strong> ${data.children || '0'}</p>
        <p><strong>Suite:</strong> ${data.suite || 'Not specified'}</p>
        
        <h3>Special Requests</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.specialRequests || 'None'}
        </div>
      `
    });

    console.log('✅ Business email sent:', businessResult.messageId);

    // Send confirmation to customer
    console.log('🏨 Sending confirmation email...');
    const confirmationResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: 'Lodge Booking Request Received - Mulambwane Safaris',
      html: `
        <h2>Thank you, ${data.firstName}!</h2>
        <p>We received your lodge booking request and will contact you within 24 hours.</p>
        
        <h3>Your Booking Request:</h3>
        <p><strong>Check-in:</strong> ${data.checkIn}</p>
        <p><strong>Check-out:</strong> ${data.checkOut}</p>
        <p><strong>Guests:</strong> ${data.adults} Adults${data.children && data.children !== '0' ? ', ' + data.children + ' Children' : ''}</p>
        <p><strong>Suite:</strong> ${data.suite || 'Not specified'}</p>
        
        ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
        
        <p>Contact: mulambwanesafaris@gmail.com | +27 73 342 6833</p>
      `
    });

    console.log('✅ Confirmation email sent:', confirmationResult.messageId);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Booking request sent successfully! We will contact you within 24 hours. Check your email for confirmation.'
      })
    };

  } catch (error) {
    console.error('❌ Booking form error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to send booking request: ' + error.message 
      })
    };
  }
};