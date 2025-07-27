const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')

// Path to JSON data
const dataPath = path.join(__dirname, '../data/packages.json')

// OpenAI setup
const openaiApiKey = process.env.OPENAI_API_KEY
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

// Load prompt.txt for bot context
let botPrompt = 'You are an event planning assistant for Planova.'
try {
  botPrompt = fs.readFileSync(path.join(__dirname, '../prompt.txt'), 'utf8')
} catch (err) {
  // fallback to default prompt
}

// POST endpoint to receive user message and return AI/FAQ answer
router.post('/', async (req, res) => {
  const userMessage = req.body.message
  if (!userMessage) {
    return res.status(400).json({ reply: 'Message is required' })
  }

  // Try FAQ match from packages.json first
  let faqReply = null
  try {
    const data = fs.readFileSync(dataPath, 'utf8')
    const jsonData = JSON.parse(data)
    const faqs = jsonData.faq || []
    const matched = faqs.find((faq) =>
      userMessage.toLowerCase().includes(faq.q.toLowerCase())
    )
    if (matched) faqReply = matched.a
  } catch (err) {
    console.error('FAQ read error:', err)
  }

  // If FAQ reply found, return it
  if (faqReply) {
    console.log('FAQ matched:', faqReply)
    return res.json({ reply: faqReply })
  }

  // Otherwise, use OpenAI for response
  if (openai) {
    try {
      console.log(
        'Calling OpenAI with prompt:',
        botPrompt,
        'and user message:',
        userMessage
      )
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: botPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 150,
      })
      const aiReply = completion.choices[0].message.content
      console.log('OpenAI reply:', aiReply)
      return res.json({ reply: aiReply })
    } catch (err) {
      console.error('OpenAI error:', err)
      return res.json({
        reply: 'Sorry, there was an error with the AI service.',
      })
    }
  } else {
    console.error('OpenAI not initialized or API key missing.')
  }

  // Fallback generic reply
  res.json({ reply: "Sorry, I couldn't find an answer to your question." })
})

module.exports = router
