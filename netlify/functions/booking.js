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
    // Parse the booking form data
    const data = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'checkIn', 'checkOut', 'adults'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Invalid email address' 
        })
      };
    }

    // Log environment variables (safely)
    console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('Full nodemailer object:', nodemailer);
    console.log('nodemailer keys:', Object.keys(nodemailer));
    console.log('nodemailer.createTransporter type:', typeof nodemailer.createTransporter);
    console.log('nodemailer.default:', nodemailer.default);
    
    // Use the correct function name: createTransport (not createTransporter)
    console.log('Using createTransport:', typeof nodemailer.createTransport);
    
    // Create email transporter (you'll need to set up environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Set this in Netlify environment variables
        pass: process.env.EMAIL_PASS  // Set this in Netlify environment variables
      }
    });

    // Format the booking details for email
    const bookingDetails = `
      NEW SAFARI LODGE BOOKING REQUEST
      ==============================
      
      Guest Information:
      - Name: ${data.firstName} ${data.lastName}
      - Email: ${data.email}
      - Phone: ${data.phone || 'Not provided'}
      
      Booking Details:
      - Check-in: ${data.checkIn}
      - Check-out: ${data.checkOut}
      - Adults: ${data.adults}
      - Children: ${data.children || 'None'}
      - Suite Preference: ${data.suite || 'No preference'}
      
      Special Requests:
      ${data.specialRequests || 'None'}
      
      ==============================
      Please respond to this booking request within 24 hours.
    `;

    // Email to your business
    const businessEmail = {
      from: process.env.EMAIL_USER,
      to: 'mulambwanesafaris@gmail.com', // Your business email
      subject: `New Safari Lodge Booking - ${data.firstName} ${data.lastName}`,
      text: bookingDetails,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 20px; text-align: center;">
            <h1> New Safari Lodge Booking Request</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #889976;">Guest Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.firstName} ${data.lastName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone || 'Not provided'}</td></tr>
            </table>
            
            <h2 style="color: #889976; margin-top: 20px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Check-in:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.checkIn}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Check-out:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.checkOut}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Adults:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.adults}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Children:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.children || 'None'}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Suite:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.suite || 'No preference'}</td></tr>
            </table>
            
            ${data.specialRequests ? `
              <h2 style="color: #889976; margin-top: 20px;">Special Requests</h2>
              <div style="background: white; padding: 15px; border-left: 4px solid #abba70; margin: 10px 0;">
                ${data.specialRequests}
              </div>
            ` : ''}
            
            <div style="background: #889976; color: white; padding: 15px; margin-top: 20px; text-align: center;">
              <p><strong>Please respond within 24 hours</strong></p>
            </div>
          </div>
        </div>
      `
    };

    // Confirmation email to customer
    const customerEmail = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: `Booking Confirmation - Mulambwane Wildlife & Hunting Safaris`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 20px; text-align: center;">
            <h1>Thank you for your booking request!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${data.firstName},</p>
            
            <p>Thank you for choosing Mulambwane Wildlife & Hunting Safaris! We have received your booking request and our team will review it shortly.</p>
            
            <div style="background: #f8f6f0; padding: 20px; border-left: 4px solid #abba70; margin: 20px 0;">
              <h3 style="color: #889976; margin-top: 0;">Your Booking Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Check-in:</strong> ${data.checkIn}</li>
                <li><strong>Check-out:</strong> ${data.checkOut}</li>
                <li><strong>Adults:</strong> ${data.adults}</li>
                <li><strong>Children:</strong> ${data.children || 'None'}</li>
                <li><strong>Suite:</strong> ${data.suite || 'No preference'}</li>
              </ul>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>We'll review your request within 24 hours</li>
              <li>You'll receive a detailed quote and availability confirmation</li>
              <li>Our team may contact you for any additional details</li>
            </ul>
            
            <p>If you have any immediate questions, please contact us:</p>
            <p><a href="mailto:mulambwanesafaris@gmail.com">mulambwanesafaris@gmail.com</a><br>
            +27 (0)73 342 6833</p>
            
            <div style="background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 15px; text-align: center; margin-top: 30px;">
              <p><em>"The Soul of Africa is Calling"</em></p>
            </div>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(businessEmail);
    await transporter.sendMail(customerEmail);

    console.log('Booking request sent successfully:', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      checkIn: data.checkIn,
      checkOut: data.checkOut
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Your booking request has been sent successfully! We will contact you within 24 hours.' 
      })
    };

  } catch (error) {
    console.error('Booking function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to process booking request. Please try again or contact us directly.' 
      })
    };
  }
};