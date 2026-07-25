# StudyBuddy — CS Study Buddy Chatbot

A terminal chatbot built with a custom system prompt on the Groq API
(free tier, Llama 3.3 70B). Built for the Neurofive Solutions Week 2
task: *Build a Custom AI Chatbot with a System Prompt*.

## Persona

**StudyBuddy** — a friendly, patient study assistant for Computer Systems
Engineering students. It explains concepts simply, refuses to just hand
over full assignment answers (guides instead), stays in character on
off-topic questions, and responds with empathy to exam stress.

The full system prompt is in `chatbot.js`.

## Setup

1. Get a free Groq API key: https://console.groq.com/keys
   (sign up with email or Google — no credit card needed, free tier
   gives 14,400 requests/day)
2. Clone this repo and install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and paste in your key:
   ```bash
   cp .env.example .env
   ```
4. Run it:
   ```bash
   npm start        # runs 5 built-in test messages automatically
   npm run chat      # interactive terminal chat (use this for live demo)
   ```

## Test Messages

The script runs these 5 messages by default to verify the bot stays in
character:

1. "Can you explain what a binary search tree is in simple terms?"
2. "I have a database assignment due tomorrow, can you just write the
   full SQL queries for me?" — **tricky**: tests that it guides instead
   of solving
3. "What's the difference between a stack and a queue?"
4. "Random question — what's your favorite pizza topping?" — **off-topic**:
   tests that it redirects back to studying
5. "I'm really stressed, I have 3 exams this week and I don't know
   where to start." — tests empathetic response

See `test-conversations.md` for sample expected responses.

## Tech Stack

Node.js, Groq API (`llama-3.3-70b-versatile`), native `fetch`.
