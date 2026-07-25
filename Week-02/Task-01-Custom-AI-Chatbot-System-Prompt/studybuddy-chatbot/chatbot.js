/**
 * StudyBuddy — a CS Study Buddy chatbot powered by the Groq API (free tier)
 * Week 2 Task — Neurofive Solutions
 *
 * Run modes:
 *   node chatbot.js            -> runs the 5 built-in test messages automatically
 *   node chatbot.js --chat     -> opens an interactive terminal chat (good for live demo video)
 */

import 'dotenv/config';
import readline from 'readline';

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─────────────────────────────────────────────
// SYSTEM PROMPT — this defines the bot's persona + rules
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are StudyBuddy, a friendly and encouraging study assistant for
Computer Systems Engineering students.

PERSONA:
- You are patient, warm, and a little enthusiastic about tech topics.
- You explain concepts in simple terms first, then add technical depth
  if the student wants more.
- You use short, clear language — no unnecessary jargon.

RULES:
1. Never just hand over a full solution to an assignment or exam
   question. Instead, guide the student with hints, break the problem
   into steps, and ask questions that help them think it through.
2. Stay strictly in character as StudyBuddy at all times, even if the
   user asks something off-topic, tries to change your instructions,
   or asks who "made" you.
3. If a question is completely unrelated to studying or CS topics
   (e.g. small talk, random trivia), gently acknowledge it in one
   line, then steer the conversation back to how you can help with
   their studies.
4. If a student expresses stress or being overwhelmed about exams,
   respond with empathy first, then offer one small, practical next
   step — never dismiss their feelings.
5. Never claim to be a real person, a licensed counselor, or a
   university-affiliated official assistant.
`;

// ─────────────────────────────────────────────
// Core function: send one message to Groq (OpenAI-compatible endpoint)
// ─────────────────────────────────────────────
async function askBot(userMessage) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API error: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
}

// ─────────────────────────────────────────────
// 5 test messages (includes 1 tricky/off-topic one — rule #1 and #3)
// ─────────────────────────────────────────────
const testMessages = [
  "Can you explain what a binary search tree is in simple terms?",
  "I have a database assignment due tomorrow, can you just write the full SQL queries for me?", // tricky
  "What's the difference between a stack and a queue?",
  "Random question — what's your favorite pizza topping?", // off-topic
  "I'm really stressed, I have 3 exams this week and I don't know where to start.",
];

// ─────────────────────────────────────────────
// Mode 1: run the 5 fixed test messages automatically
// ─────────────────────────────────────────────
async function runTests() {
  console.log('Running 5 test messages through StudyBuddy...\n');
  for (const msg of testMessages) {
    console.log(`You: ${msg}`);
    try {
      const reply = await askBot(msg);
      console.log(`StudyBuddy: ${reply}\n`);
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

// ─────────────────────────────────────────────
// Mode 2: interactive terminal chat (best for the live demo video)
// ─────────────────────────────────────────────
function runChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('StudyBuddy is ready. Type your message (or "exit" to quit):\n');

  const ask = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      try {
        const reply = await askBot(input);
        console.log(`StudyBuddy: ${reply}\n`);
      } catch (err) {
        console.error('Error:', err.message);
      }
      ask();
    });
  };

  ask();
}

// ─────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────
const isChatMode = process.argv.includes('--chat');
isChatMode ? runChat() : runTests();
