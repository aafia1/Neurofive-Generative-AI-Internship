# Structured Outputs — Support Ticket JSON Extractor

Week 3 · Generative AI & Prompt Engineering — Structured Outputs task.

Forces an LLM to turn a raw, messy customer support message into clean,
schema-conformant JSON that can be piped straight into a ticketing system,
instead of a free-text paragraph.

## Use case

Extract `{name, email, issue_type, urgency, summary}` from an arbitrary
customer support message.

## Files

| File | What it is |
|---|---|
| `schema.json` | Formal JSON Schema (draft-07) the output must match |
| `prompts.md` | Prompt v1 (initial) and v2 (fixed after adversarial testing) |
| `test_results.md` | 5 clean test inputs + 1 adversarial input, before/after the fix |
| `test_runner.py` | Script that calls the Claude API live and validates every response with `json.loads()` |
| `requirements.txt` | Python dependency (`anthropic` SDK) |
| `.env.example` | Shows which environment variable to set — **never commit a real key** |

## How it works

1. **Schema** (`schema.json`) defines the exact shape of the output —
   required fields, enum values for `issue_type` and `urgency`.
2. **Prompt v1** (`prompts.md`) instructs the model to return only JSON
   matching that schema.
3. Tested on 5 varied inputs — all passed (`test_results.md`, Tests 1–5).
4. **Adversarial test** (Test 6): a message combining a prompt injection
   ("ignore all previous instructions") with a request to reformat the
   output as markdown. This broke v1 — the model added a preamble and
   wrapped the JSON in a ` ```json ` code fence, which fails `json.loads()`.
5. **Prompt v2** fixes it with three explicit rules: no code fences, a
   first-char/last-char self-check, and an instruction to treat the user
   message strictly as data, never as instructions. Re-tested: all 6 pass,
   including the adversarial one, with no regressions on the original 5.

## Running it yourself

```bash
git clone <this-repo-url>
cd structured-json-task
pip install -r requirements.txt

# set your own key — get one at https://console.anthropic.com
export ANTHROPIC_API_KEY="your-key-here"   # macOS/Linux
# setx ANTHROPIC_API_KEY "your-key-here"   # Windows

python test_runner.py
```

This prints the raw output for each of the 6 test messages and reports
pass/fail based on whether `json.loads()` succeeds and all required keys
are present.



## Result summary

- 5/5 clean inputs → valid JSON on prompt v1.
- 1/1 adversarial input → broke v1 (code fence + preamble), fixed in v2.
- 6/6 valid JSON after the fix, no regressions.

See `test_results.md` for full input/output pairs and `prompts.md` for
the complete before/after prompt text.
