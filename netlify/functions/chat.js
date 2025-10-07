const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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

    // Call OpenAI API (API key stored as environment variable in Netlify)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
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
          message: data.choices[0].message.content.trim()
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