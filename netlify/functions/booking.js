const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight CORS requests
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

  try {
    const data = JSON.parse(event.body);
    
    // Create email transporter - EXACT WORKING METHOD
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true,
      logger: true
    });

    // Test the transporter
    try {
      console.log('Testing email transporter...');
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Email service configuration error',
          details: verifyError.message 
        })
      };
    }

    // Email to business
    const businessEmail = {
      from: process.env.EMAIL_USER,
      to: 'mulambwanesafaris@gmail.com',
      subject: `Lodge Booking Request - ${data.firstName} ${data.lastName}`,
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
        <p><strong>Suite Preference:</strong> ${data.suite || 'Not specified'}</p>
        
        <h3>Special Requests</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.specialRequests || 'None'}
        </div>
        <hr>
        <p><em>Sent from Mulambwane Safari Website Lodge Booking Form</em></p>
      `
    };

    // Confirmation email to customer
    const confirmationEmail = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: 'Lodge Booking Request Received - Mulambwane Wildlife & Hunting Safaris',
      html: `
        <h2>Thank you for your booking request, ${data.firstName}!</h2>
        <p>We have received your lodge booking request and will contact you within 24 hours to confirm availability and provide detailed information.</p>
        
        <h3>Your Booking Request:</h3>
        <p><strong>Check-in:</strong> ${data.checkIn}<br>
        <strong>Check-out:</strong> ${data.checkOut}<br>
        <strong>Guests:</strong> ${data.adults} Adults${data.children && data.children !== '0' ? ', ' + data.children + ' Children' : ''}<br>
        <strong>Suite Preference:</strong> ${data.suite || 'Not specified'}</p>
        
        ${data.specialRequests ? `<h3>Special Requests:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.specialRequests}
        </div>` : ''}
        
        <h3>Contact Information:</h3>
        <p><strong>Email:</strong> <a href="mailto:mulambwanesafaris@gmail.com">mulambwanesafaris@gmail.com</a><br>
        <strong>Phone:</strong> +27 73 342 6833<br>
        <strong>Bookings:</strong> <a href="mailto:mulambwanesafaris@gmail.com">mulambwanesafaris@gmail.com</a></p>
        
        <p>Best regards,<br>
        Mulambwane Wildlife & Hunting Safaris Team</p>
      `
    };

    // Send both emails
    console.log('Sending business notification email...');
    const businessResult = await transporter.sendMail(businessEmail);
    console.log('✅ Business email sent:', businessResult.messageId);

    console.log('Sending customer confirmation email...');
    const confirmationResult = await transporter.sendMail(confirmationEmail);
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
    console.error('Booking form error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to send booking request: ' + error.message 
      })
    };
  }
};