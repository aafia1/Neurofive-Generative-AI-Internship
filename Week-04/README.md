# Multi-Agent Basics — Two AIs Working Together

This project demonstrates a simple but effective multi-agent workflow: one AI writes a first draft, and a second AI reviews, improves, and explains the changes. It is a polished, browser-based version of a manual two-step agent pipeline that is easy to present, run, and upload to GitHub.

## Why this project matters

The biggest shift in modern AI is moving from a single prompt producing one answer to multiple specialized agents collaborating on the same task. This demo shows that idea in a clear and accessible way:

- Agent 1 acts as the Writer and generates an initial draft.
- Agent 2 acts as the Editor and refines the content for clarity, flow, and strength.
- The output of the first agent becomes the input of the second agent, which is the core of the orchestration.

## What the project includes

- A browser UI for running the pipeline live
- A Writer agent with a clear drafting persona
- An Editor agent with a review-and-revision persona
- A visible list of the changes the Editor made
- A run history panel so you can compare multiple topics easily

## Project files

| File | Purpose |
|---|---|
| [writer-editor-pipeline.html](writer-editor-pipeline.html) | The polished live demo you can open in a browser and present in a video.
| [writer-editor-pipeline.js](writer-editor-pipeline.js) | The Node.js version of the same two-agent pipeline for terminal-based runs.
| [README.md](README.md) | GitHub-ready project documentation and setup guide. |

## How the pipeline works

### Agent 1 — Writer
The Writer is responsible for producing a clear, informative draft around a topic. Its job is to generate ideas quickly and provide a strong first version, even if it is not perfectly polished.

### Agent 2 — Editor
The Editor receives the raw draft and improves it by:

- tightening weak sentences
- improving structure and transitions
- strengthening openings and closings
- removing repetition and filler
- preserving the original ideas and voice

This handoff creates the core multi-agent experience: draft first, then refine.

## Run it locally

### Option 1 — Browser demo (recommended for presentation)
1. Open [writer-editor-pipeline.html](writer-editor-pipeline.html) in your browser.
2. Enter a topic.
3. Click Run Pipeline.
4. Review the raw draft, the revised version, and the Editor's notes.

### Option 2 — Node.js version
```bash
npm init -y

# Windows PowerShell
$env:GROQ_API_KEY="gsk_..."

# Mac/Linux
export GROQ_API_KEY="gsk_..."

node writer-editor-pipeline.js "the history of the printing press"
```

> The app uses Groq's API through an OpenAI-compatible endpoint. It is free to use for testing and requires only a Groq API key.

## What to compare in your demo

Run the pipeline on two different topics and note the differences in the before/after results. Good things to compare include:

- how much the Editor improved the opening
- whether the structure became more logical
- how much filler or repetition was removed
- how much the closing became stronger

## Suggested video structure

1. Introduce the concept of multi-agent orchestration.
2. Show the Writer and Editor roles clearly.
3. Run one example live and explain the before/after transformation.
4. Show a second topic briefly to highlight consistency.
5. End with a short reflection on why separating drafting from editing improves output quality.

## GitHub-ready notes

This repository is designed to be easy to share and present. The UI is more polished for visual impact, while the code remains simple enough to explain clearly in a short assignment or demo video.
