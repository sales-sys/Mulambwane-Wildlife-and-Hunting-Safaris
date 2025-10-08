const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback responses for testing
      const fallbackResponses = {
        'hello': 'Hello! Welcome to Mulambwane Wildlife & Hunting Safaris! How can I help you today?',
        'hunting': 'We offer professional hunting safaris featuring Big 5 game including Cape Buffalo, Greater Kudu, Sable Antelope, and more. Our experienced guides provide spoor reading and bushcraft training.',
        'lodge': 'Our luxury bush suites offer authentic African accommodation with modern amenities. We have a traditional boma, common lounge area, and cultural experiences.',
        'game meat': 'We provide premium game meat including traditional biltong, droëwors, prime cuts, and game boerewors. All ethically sourced from our conservation efforts.',
        'booking': 'You can book through our lodge reservation form or contact us directly at info@mulambwane.com or +27 123 456 789.',
        'default': 'Thank you for your interest in Mulambwane Wildlife & Hunting Safaris! We offer hunting safaris, luxury lodge accommodation, and premium game meat. For specific inquiries, please contact us at info@mulambwane.com or +27 123 456 789.'
      };
      
      const lowerMessage = message.toLowerCase();
      let response = fallbackResponses.default;
      
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ reply: response })
      };
    }

    // Call OpenAI API (API key stored as environment variable in Netlify)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for Mulambwane Wildlife & Hunting Safaris in Waterpoort Louis Trichardt, Limpopo Province, South Africa. Answer questions about hunting safaris, wildlife conservation, game meat, lodge accommodations, and safari experiences. Be professional, knowledgeable, and maintain the warm, authentic South African hospitality tone of the brand. Keep responses concise and informative.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || 'Failed to get response from AI'
        })
      };
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          reply: data.choices[0].message.content.trim()
        })
      };
    } else {
      console.error('Unexpected response format:', data);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Unexpected response format from AI'
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error: ' + error.message
      })
    };
  }
};