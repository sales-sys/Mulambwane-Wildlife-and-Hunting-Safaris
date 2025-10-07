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
    // Parse the contact form data
    const data = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
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
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Set this in Netlify environment variables
        pass: process.env.EMAIL_PASS  // Set this in Netlify environment variables
      }
    });

    // Map interest categories to better descriptions
    const interestMap = {
      'Hunting Safari': 'Hunting Safari',
      'Accommodation': 'Lodge Accommodation', 
      'Game Meat': 'Premium Game Meat',
      'General Inquiry': 'General Inquiry'
    };

    // Format the inquiry details for email
    const inquiryDetails = `
      NEW SAFARI INQUIRY
      ==================
      
      Contact Information:
      - Name: ${data.firstName} ${data.lastName}
      - Email: ${data.email}
      - Phone: ${data.phone || 'Not provided'}
      
      Inquiry Type: ${interestMap[data.interest] || data.interest}
      
      Message:
      ${data.message}
      
      ==================
      Sent from: Mulambwane Wildlife & Hunting Safaris Website
    `;

    // Email to your business
    const businessEmail = {
      from: process.env.EMAIL_USER,
      to: 'Sales@mumarketing.org', // Your general inquiry email
      subject: `New Inquiry: ${data.interest || 'General'} - ${data.firstName} ${data.lastName}`,
      text: inquiryDetails,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 20px; text-align: center;">
            <h1>New Safari Inquiry</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #889976;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.firstName} ${data.lastName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Interest:</td><td style="padding: 8px; border: 1px solid #ddd;">${interestMap[data.interest] || data.interest}</td></tr>
            </table>
            
            <h2 style="color: #889976;">Message</h2>
            <div style="background: white; padding: 20px; border-left: 4px solid #abba70; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="background: #889976; color: white; padding: 15px; margin-top: 20px; text-align: center; border-radius: 5px;">
              <p><strong>Please respond promptly to maintain our excellent customer service!</strong></p>
            </div>
          </div>
        </div>
      `
    };

    // Confirmation email to customer
    const customerEmail = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: `Thank you for your inquiry - Mulambwane Wildlife & Hunting Safaris`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 20px; text-align: center;">
            <h1>Thank you for contacting us!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${data.firstName},</p>
            
            <p>Thank you for your interest in Mulambwane Wildlife & Hunting Safaris! We have received your inquiry and our team will respond to you shortly.</p>
            
            <div style="background: #f8f6f0; padding: 20px; border-left: 4px solid #abba70; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #889976; margin-top: 0;">Your Inquiry Summary:</h3>
              <p><strong>Interest:</strong> ${interestMap[data.interest] || data.interest}</p>
              <p><strong>Your Message:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 5px; font-style: italic;">
                "${data.message}"
              </div>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our expert team will review your inquiry</li>
              <li>You'll receive a personalized response within 24-48 hours</li>
              <li>We may call you to discuss your safari dreams in detail</li>
            </ul>
            
            <p>In the meantime, feel free to explore more about our offerings on our website or contact us directly:</p>
            
            <div style="background: #f8f6f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> <a href="mailto:info@mulambwane.co.za">info@mulambwane.co.za</a><br>
              <strong>Phone:</strong> +27 (0)15 793 2436<br>
              <strong>Bookings:</strong> <a href="mailto:Sales@mumarketing.org">Sales@mumarketing.org</a></p>
            </div>
            
            <div style="background: linear-gradient(135deg, #889976, #abba70); color: white; padding: 20px; text-align: center; margin-top: 30px; border-radius: 5px;">
              <p style="margin: 0; font-size: 18px;"><em>"Experience the soul of Africa with us"</em></p>
              <p style="margin: 5px 0 0 0;">Mulambwane Wildlife & Hunting Safaris</p>
            </div>
          </div>
        </div>
      `
    };

    // Send both emails
    console.log('Attempting to send emails...');
    await transporter.sendMail(businessEmail);
    console.log('Business email sent successfully');
    
    await transporter.sendMail(customerEmail);
    console.log('Customer email sent successfully');

    console.log('Contact inquiry sent successfully:', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      interest: data.interest
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Your inquiry has been sent successfully! We will respond within 24-48 hours.' 
      })
    };

  } catch (error) {
    console.error('Contact function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to send inquiry. Please try again or contact us directly.' 
      })
    };
  }
};