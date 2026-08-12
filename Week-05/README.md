# No-Code AI Automation — Connect AI to a Real Workflow

**Cohort task:** Week 5 · Generative AI & Prompt Engineering

## Live Workflow Link

[n8n Workflow — Feedback Form → AI Categorizer](https://aafia1.app.n8n.cloud/workflow/3zJkwrrVBpxk2DZS?projectId=RSX2T6W54xsSUfi8)

## Overview

This project automates the processing of customer feedback form submissions. When a new response is submitted through a Google Form, the workflow triggers automatically, sends the submission to an AI model for categorization and reply drafting, and writes the results back into the same Google Sheet — with no manual intervention required.

## Trigger

A new row added to a Google Sheet, populated automatically by responses to a linked Google Form (Name, Email, Message fields).

## Platform

Built in **n8n** (cloud, free trial tier).

## AI Step

- **Provider:** Groq API
- **Model:** `llama-3.1-8b-instant`
- **What it does:** reads each submission and returns a category (Complaint / Question / Praise / Other), a one-sentence summary, and a drafted reply.

## Final Action

The AI's output (Category, Summary, AI Reply) is written back into the corresponding row of the same Google Sheet, matched by the submitter's email address.

## Workflow Architecture

Four connected nodes:

1. **New Feedback Row** — Google Sheets Trigger, polls for newly added rows every minute.
2. **HTTP Request** — sends the row's data to the Groq chat completions API with a prompt instructing the model to categorize, summarize, and draft a reply.
3. **Parse AI Output** — a Code node that extracts and parses the AI's JSON response into clean fields.
4. **Update Sheet With AI Result** — writes the parsed values back into the Google Sheet.

## Testing

Tested end-to-end with multiple real form submissions covering different message types (complaint, question, praise) to confirm the AI categorizes and drafts replies correctly for each case.

## Files in this submission

- `No-Code_AI_Automation_Report.docx` — full project report with architecture, prompt used, and test results
- `README.md` — this file, with the live workflow link
- Demo video (2-3 min) — shows the trigger firing and the AI-generated result appearing in the sheet
