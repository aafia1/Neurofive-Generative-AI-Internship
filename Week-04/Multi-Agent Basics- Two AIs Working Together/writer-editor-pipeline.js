/**
 * Multi-Agent Basics — Writer -> Editor pipeline
 * -----------------------------------------------
 * Manual two-step API-call chain (no framework required):
 *   Agent 1 "Writer"  -> drafts an article on a topic
 *   Agent 2 "Editor"  -> reviews & improves Agent 1's raw output
 *
 * Agent 1's output becomes Agent 2's input. That handoff IS the
 * "multi-agent orchestration" for this assignment.
 *
 * Uses Groq's API (OpenAI-compatible endpoint) — free tier, no
 * credit card required, generous rate limits. Get a key in seconds
 * at https://console.groq.com/keys
 *
 * Setup:
 *   npm init -y
 *   Set your API key as an environment variable before running:
 *     Windows (PowerShell):  $env:GROQ_API_KEY="gsk_..."
 *     Mac/Linux:              export GROQ_API_KEY="gsk_..."
 *
 * Run:
 *   node writer-editor-pipeline.js "the history of the printing press"
 */

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

// ---------- Agent 1: WRITER ----------
const WRITER_SYSTEM_PROMPT = `You are DRAFT — a fast first-draft writer.
Responsibility: given a topic, write a clear, informative 250-350 word
article: a strong opening hook, 2-3 body points, a brief close.
Prioritize getting good ideas down over polishing prose — leave some
rough edges, that is the Editor's job. Output ONLY the article body,
no title, no meta-commentary.`;

// ---------- Agent 2: EDITOR / CRITIC ----------
const EDITOR_SYSTEM_PROMPT = `You are REVISE — a meticulous editor and critic.
Responsibility: you receive a first draft and improve it. Tighten weak
sentences, fix structure and flow, strengthen the opening and closing,
correct vague claims, cut filler and repetition. Preserve the author's
core ideas and voice — do not rewrite from scratch.
Respond in EXACTLY this format, nothing else:
[REVISED]
<the improved article>
[NOTES]
<3-6 bullet points, each starting with "-", each naming ONE specific
change you made and why>`;

/**
 * Single reusable call to the Groq chat completions API.
 * Both agents use this same function with different system prompts —
 * that's what makes them "two agents" rather than one long prompt.
 */
async function callAgent(systemPrompt, userMessage) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API call failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/** Splits the Editor's structured reply into { revised, notes } */
function parseEditorReply(raw) {
  const revMatch = raw.match(/\[REVISED\]([\s\S]*?)\[NOTES\]/i);
  const noteMatch = raw.match(/\[NOTES\]([\s\S]*)/i);
  const revised = revMatch ? revMatch[1].trim() : raw.trim();
  const notes = noteMatch
    ? noteMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
    : [];
  return { revised, notes };
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function runPipeline(topic) {
  if (!API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Export it as an environment variable before running."
    );
  }

  console.log(`\n=== TOPIC: ${topic} ===\n`);

  // Step 1 — Agent 1 (Writer) produces the raw draft
  console.log("[Agent 1 · Writer] drafting...");
  const draft = await callAgent(WRITER_SYSTEM_PROMPT, `Topic: ${topic}`);
  console.log("\n--- RAW DRAFT (Agent 1 output) ---\n");
  console.log(draft);
  console.log(`\n(${wordCount(draft)} words)\n`);

  // Step 2 — Agent 1's output becomes Agent 2's input
  console.log("[Agent 2 · Editor] reviewing Agent 1's draft...");
  const editorRaw = await callAgent(
    EDITOR_SYSTEM_PROMPT,
    `Here is the draft to review:\n\n${draft}`
  );
  const { revised, notes } = parseEditorReply(editorRaw);

  console.log("\n--- FINAL, POST-EDITOR OUTPUT ---\n");
  console.log(revised);
  console.log(`\n(${wordCount(revised)} words)\n`);

  console.log("--- EDITOR'S NOTES (what changed) ---");
  notes.forEach((n) => console.log(`  - ${n}`));

  return { topic, draft, revised, notes };
}

// ---------- Entry point ----------
// Usage: node writer-editor-pipeline.js "your topic here"
const topicArg = process.argv.slice(2).join(" ") || "why sleep matters for memory";

runPipeline(topicArg).catch((err) => {
  console.error("Pipeline failed:", err.message);
  process.exit(1);
});
