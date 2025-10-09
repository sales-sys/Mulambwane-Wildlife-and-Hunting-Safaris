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
      subject: `🏨 New Lodge Booking Request - ${data.firstName} ${data.lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #889976 0%, #abba70 100%); padding: 30px; text-align: center; }
            .logo-text { color: white; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .tagline { color: #ffffff; font-size: 14px; margin: 5px 0 0 0; opacity: 0.9; }
            .banner { background: #212022; color: #abba70; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
            .content { padding: 30px; }
            .booking-summary { background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; }
            .guest-info { background: #f8f9fa; border-left: 5px solid #889976; padding: 20px; margin: 20px 0; }
            .booking-details { background: #f8f9fa; border-left: 5px solid #abba70; padding: 20px; margin: 20px 0; }
            .field-row { margin: 12px 0; }
            .field-label { font-weight: bold; color: #212022; display: inline-block; width: 130px; }
            .field-value { color: #555; }
            .highlight-value { color: #889976; font-weight: bold; }
            .special-box { background: #212022; color: #abba70; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #212022; color: #abba70; padding: 20px; text-align: center; font-size: 12px; }
            .divider { height: 3px; background: linear-gradient(90deg, #889976, #abba70, #889976); margin: 20px 0; }
            .priority-badge { background: #abba70; color: #212022; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text">MULAMBWANE WILDLIFE & HUNTING SAFARIS</h1>
              <p class="tagline">Heart of Limpopo • Luxury Bush Experience</p>
            </div>
            
            <div class="banner">
              🏨 NEW LODGE BOOKING REQUEST <span class="priority-badge">HIGH PRIORITY</span>
            </div>
            
            <div class="content">
              <div class="booking-summary">
                <h3 style="margin-top: 0; text-align: center;">Lodge Reservation Request</h3>
                <p style="margin: 0; text-align: center; font-size: 16px;">
                  <strong>${data.checkIn}</strong> to <strong>${data.checkOut}</strong> • ${data.adults} Adults${data.children && data.children !== '0' ? ', ' + data.children + ' Children' : ''}
                </p>
              </div>
              
              <div class="guest-info">
                <h3 style="color: #889976; margin-top: 0;">Guest Information</h3>
                <div class="field-row">
                  <span class="field-label">Primary Guest:</span>
                  <span class="field-value highlight-value">${data.firstName} ${data.lastName}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Email:</span>
                  <span class="field-value">${data.email}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Phone:</span>
                  <span class="field-value">${data.phone || 'Not provided'}</span>
                </div>
              </div>
              
              <div class="booking-details">
                <h3 style="color: #abba70; margin-top: 0;">Booking Details</h3>
                <div class="field-row">
                  <span class="field-label">Check-in Date:</span>
                  <span class="field-value highlight-value">${data.checkIn}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Check-out Date:</span>
                  <span class="field-value highlight-value">${data.checkOut}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Adults:</span>
                  <span class="field-value highlight-value">${data.adults}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Children:</span>
                  <span class="field-value">${data.children || '0'}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Suite Preference:</span>
                  <span class="field-value">${data.suite || 'Not specified'}</span>
                </div>
              </div>
              
              ${data.specialRequests ? `
              <div class="special-box">
                <h3 style="margin-top: 0; color: #abba70;">Special Requests & Requirements</h3>
                <p style="margin: 0; line-height: 1.6;">${data.specialRequests}</p>
              </div>
              ` : ''}
              
              <div class="divider"></div>
              
              <p style="color: #555; margin-top: 30px; text-align: center;">
                <strong>Action Required:</strong> Confirm availability and respond within 24 hours to secure this premium lodge booking.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>Mulambwane Wildlife & Hunting Safaris - Lodge Reservations</strong></p>
              <p style="margin: 5px 0;">Waterpoort Louis Trichardt, Limpopo Province, South Africa</p>
              <p style="margin: 5px 0;">📧 mulambwanesafaris@gmail.com • 📞 +27 73 342 6833</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Business email sent:', businessResult.messageId);

    // Send confirmation to customer
    console.log('🏨 Sending confirmation email...');
    const confirmationResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: '🏨 Lodge Booking Confirmation - Mulambwane Wildlife & Hunting Safaris',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #889976 0%, #abba70 100%); padding: 30px; text-align: center; }
            .logo-text { color: white; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .tagline { color: #ffffff; font-size: 14px; margin: 5px 0 0 0; opacity: 0.9; }
            .welcome-banner { background: #212022; color: #abba70; padding: 20px; text-align: center; }
            .welcome-title { font-size: 24px; margin: 0; font-weight: bold; }
            .content { padding: 30px; }
            .booking-card { background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 25px; border-radius: 15px; margin: 20px 0; text-align: center; }
            .booking-summary { background: #f8f9fa; border: 2px solid #abba70; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .amenities-grid { display: table; width: 100%; margin: 20px 0; }
            .amenity-item { display: table-cell; width: 25%; text-align: center; padding: 15px; }
            .amenity-icon { font-size: 24px; margin-bottom: 8px; }
            .contact-box { background: #212022; color: #abba70; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: linear-gradient(135deg, #889976 0%, #abba70 100%); color: white; padding: 20px; text-align: center; font-size: 12px; }
            .divider { height: 3px; background: linear-gradient(90deg, #889976, #abba70, #889976); margin: 20px 0; }
            .highlight { background: #abba70; color: #212022; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text">MULAMBWANE WILDLIFE & HUNTING SAFARIS</h1>
              <p class="tagline">Heart of Limpopo • Luxury Bush Experience</p>
            </div>
            
            <div class="welcome-banner">
              <h2 class="welcome-title">Welcome to Paradise, ${data.firstName}!</h2>
            </div>
            
            <div class="content">
              <div class="booking-card">
                <h3 style="margin-top: 0;">Your Lodge Booking Request Received!</h3>
                <p style="margin: 0; font-size: 16px;">We will contact you within 24 hours to confirm availability and finalize your luxury bush experience.</p>
              </div>
              
              <div class="highlight">
                Your safari adventure awaits in the pristine wilderness of Limpopo Province
              </div>
              
              <div class="booking-summary">
                <h3 style="color: #889976; margin-top: 0; text-align: center;">Your Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold; color: #212022;">Guest Name:</td>
                    <td style="padding: 10px; color: #555;">${data.firstName} ${data.lastName}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold; color: #212022;">Check-in Date:</td>
                    <td style="padding: 10px; color: #889976; font-weight: bold;">${data.checkIn}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold; color: #212022;">Check-out Date:</td>
                    <td style="padding: 10px; color: #889976; font-weight: bold;">${data.checkOut}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold; color: #212022;">Guests:</td>
                    <td style="padding: 10px; color: #555;">${data.adults} Adults${data.children && data.children !== '0' ? ', ' + data.children + ' Children' : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #212022;">Suite Preference:</td>
                    <td style="padding: 10px; color: #555;">${data.suite || 'Not specified'}</td>
                  </tr>
                </table>
              </div>
              
              ${data.specialRequests ? `
              <div style="background: #889976; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Special Requests:</h3>
                <p style="margin: 0; line-height: 1.6;">"${data.specialRequests}"</p>
              </div>
              ` : ''}
              
              <div class="divider"></div>
              
              <h3 style="color: #212022; text-align: center;">Your Lodge Experience Includes</h3>
              <div class="amenities-grid">
                <div class="amenity-item">
                  <div class="amenity-icon">🏡</div>
                  <h5 style="color: #889976; margin: 5px 0;">Luxury Suites</h5>
                  <p style="font-size: 11px; color: #666; margin: 0;">Authentic bush accommodation</p>
                </div>
                <div class="amenity-item">
                  <div class="amenity-icon">🍽️</div>
                  <h5 style="color: #889976; margin: 5px 0;">Traditional Boma</h5>
                  <p style="font-size: 11px; color: #666; margin: 0;">Authentic African dining</p>
                </div>
                <div class="amenity-item">
                  <div class="amenity-icon">🦌</div>
                  <h5 style="color: #889976; margin: 5px 0;">Wildlife Viewing</h5>
                  <p style="font-size: 11px; color: #666; margin: 0;">Big 5 and more</p>
                </div>
                <div class="amenity-item">
                  <div class="amenity-icon">🌿</div>
                  <h5 style="color: #889976; margin: 5px 0;">Bush Walks</h5>
                  <p style="font-size: 11px; color: #666; margin: 0;">Guided nature experiences</p>
                </div>
              </div>
              
              <div class="contact-box">
                <h3 style="margin-top: 0; color: #abba70;">Direct Contact</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> mulambwanesafaris@gmail.com</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> +27 73 342 6833</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> Waterpoort Louis Trichardt, Limpopo Province</p>
              </div>
              
              <p style="text-align: center; color: #555; margin-top: 30px; font-style: italic;">
                "Prepare for an unforgettable journey into the heart of African wilderness"
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0; font-weight: bold;">Best regards,</p>
              <p style="margin: 5px 0;">The Mulambwane Safari Lodge Team</p>
              <p style="margin: 5px 0; opacity: 0.8;">Where luxury meets the wild</p>
            </div>
          </div>
        </body>
        </html>
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