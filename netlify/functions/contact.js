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
      subject: `🦁 New Website Inquiry - ${data.firstName} ${data.lastName}`,
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
            .inquiry-box { background: #f8f9fa; border-left: 5px solid #889976; padding: 20px; margin: 20px 0; }
            .field-row { margin: 15px 0; }
            .field-label { font-weight: bold; color: #212022; display: inline-block; width: 120px; }
            .field-value { color: #555; }
            .message-box { background: #889976; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #212022; color: #abba70; padding: 20px; text-align: center; font-size: 12px; }
            .divider { height: 3px; background: linear-gradient(90deg, #889976, #abba70, #889976); margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text">MULAMBWANE WILDLIFE & HUNTING SAFARIS</h1>
              <p class="tagline">Heart of Limpopo • Authentic African Experience</p>
            </div>
            
            <div class="banner">
              🦁 NEW WEBSITE INQUIRY RECEIVED
            </div>
            
            <div class="content">
              <div class="inquiry-box">
                <h3 style="color: #889976; margin-top: 0;">Contact Information</h3>
                <div class="field-row">
                  <span class="field-label">Name:</span>
                  <span class="field-value">${data.firstName} ${data.lastName}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Email:</span>
                  <span class="field-value">${data.email}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Phone:</span>
                  <span class="field-value">${data.phone || 'Not provided'}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Interest:</span>
                  <span class="field-value">${data.interest || 'General Inquiry'}</span>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <div class="message-box">
                <h3 style="margin-top: 0; color: white;">Customer Message:</h3>
                <p style="margin: 0; line-height: 1.6;">${data.message}</p>
              </div>
              
              <p style="color: #555; margin-top: 30px;">
                <strong>Next Steps:</strong> Respond within 24 hours to maintain excellent customer service standards.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>Mulambwane Wildlife & Hunting Safaris</strong></p>
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
    console.log('📧 Sending confirmation email...');
    const confirmationResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: '🦁 Thank you for contacting Mulambwane Wildlife & Hunting Safaris',
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
            .highlight-box { background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .message-recap { background: #f8f9fa; border-left: 5px solid #abba70; padding: 20px; margin: 20px 0; }
            .services-grid { display: table; width: 100%; margin: 20px 0; }
            .service-item { display: table-cell; width: 33.33%; text-align: center; padding: 15px; }
            .service-icon { font-size: 30px; margin-bottom: 10px; }
            .contact-box { background: #212022; color: #abba70; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: linear-gradient(135deg, #889976 0%, #abba70 100%); color: white; padding: 20px; text-align: center; font-size: 12px; }
            .divider { height: 3px; background: linear-gradient(90deg, #889976, #abba70, #889976); margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text">MULAMBWANE WILDLIFE & HUNTING SAFARIS</h1>
              <p class="tagline">Heart of Limpopo • Authentic African Experience</p>
            </div>
            
            <div class="welcome-banner">
              <h2 class="welcome-title">Welcome to the Wild, ${data.firstName}!</h2>
            </div>
            
            <div class="content">
              <div class="highlight-box">
                <h3 style="margin-top: 0;">Thank You for Your Inquiry!</h3>
                <p style="margin: 0; font-size: 16px;">We have received your message and will respond within 24 hours with detailed information about your safari adventure.</p>
              </div>
              
              <div class="message-recap">
                <h3 style="color: #889976; margin-top: 0;">Your Message to Us:</h3>
                <p style="margin: 0; line-height: 1.6; color: #555;">"${data.message}"</p>
              </div>
              
              <div class="divider"></div>
              
              <h3 style="color: #212022; text-align: center;">Our Safari Experiences</h3>
              <div class="services-grid">
                <div class="service-item">
                  <div class="service-icon">🏹</div>
                  <h4 style="color: #889976; margin: 10px 0 5px;">Hunting Safaris</h4>
                  <p style="font-size: 12px; color: #666; margin: 0;">Big 5 • Professional Guides</p>
                </div>
                <div class="service-item">
                  <div class="service-icon">🏨</div>
                  <h4 style="color: #889976; margin: 10px 0 5px;">Luxury Lodge</h4>
                  <p style="font-size: 12px; color: #666; margin: 0;">Bush Suites • Authentic Dining</p>
                </div>
                <div class="service-item">
                  <div class="service-icon">🥩</div>
                  <h4 style="color: #889976; margin: 10px 0 5px;">Game Meat</h4>
                  <p style="font-size: 12px; color: #666; margin: 0;">Premium Biltong • Fresh Cuts</p>
                </div>
              </div>
              
              <div class="contact-box">
                <h3 style="margin-top: 0; color: #abba70;">Contact Information</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> mulambwanesafaris@gmail.com</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> +27 73 342 6833</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> Waterpoort Louis Trichardt, Limpopo Province, South Africa</p>
              </div>
              
              <p style="text-align: center; color: #555; margin-top: 30px;">
                <em>"Experience the untamed beauty of Africa with Mulambwane Wildlife & Hunting Safaris"</em>
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0; font-weight: bold;">Best regards,</p>
              <p style="margin: 5px 0;">The Mulambwane Safari Team</p>
              <p style="margin: 5px 0; opacity: 0.8;">Your gateway to authentic African wilderness</p>
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