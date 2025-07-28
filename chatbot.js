const OpenAI = require('openai')
require('dotenv').config()

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

exports.askChatbot = async (req, res) => {
  const userInput = req.body.question

  if (!userInput) {
    return res.status(400).json({ reply: 'Please provide a question.' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: 'OpenAI service is not configured.' })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful chatbot for Planova, an event planning company. You specialize in helping customers with wedding planning, birthday parties, corporate events, and other celebrations. Provide helpful advice about packages, services, decorations, catering, venues, and event logistics. Be friendly, professional, and informative.',
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const botResponse = completion.choices[0].message.content
    res.json({ reply: botResponse })
  } catch (error) {
    console.error('OpenAI Error:', error)

    if (error.code === 'insufficient_quota') {
      res
        .status(500)
        .json({
          reply:
            "I'm temporarily unavailable due to API limits. Please try again later.",
        })
    } else if (error.code === 'invalid_api_key') {
      res
        .status(500)
        .json({ reply: 'Service configuration error. Please contact support.' })
    } else {
      res
        .status(500)
        .json({
          reply:
            "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        })
    }
  }
}
