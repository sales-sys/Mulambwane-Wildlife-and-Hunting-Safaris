const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  try {
    console.log('EMAIL TEST STARTING...');
    console.log('Environment variables check:');
    console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_USER value:', process.env.EMAIL_USER);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Missing environment variables',
          hasUser: !!process.env.EMAIL_USER,
          hasPass: !!process.env.EMAIL_PASS
        })
      };
    }

    // Test Gmail connection
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('Testing connection...');
    await transporter.verify();
    console.log('✅ Gmail connection successful!');

    // Send test email
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'mulambwanesafaris@gmail.com',
      subject: 'Email Test - Mulambwane Safaris',
      text: 'This is a test email to verify the email system is working!'
    });

    console.log('✅ Test email sent:', result.messageId);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Email test successful!',
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Email test failed: ' + error.message,
        stack: error.stack
      })
    };
  }
};