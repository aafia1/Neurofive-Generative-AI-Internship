# 📄 Research Digest & Literature Review Assistant

A capstone mini-app built for Week 6 (Generative AI & Prompt Engineering) —
combines prompt design, structured JSON outputs, and a lightweight RAG
pipeline into one working tool.

## The problem

Reading and re-reading academic papers to prep for a thesis defense (or just
to keep a literature review organized) is slow and repetitive. Students end
up manually re-extracting the same five things from every paper: what
problem it solves, how, what it found, where it falls short, and what a
panel might grill you on.

## What it does

**1. Paper Digest** — paste text or upload a PDF/TXT of a paper. The app
sends it to Claude with a strict JSON schema and returns:
- Problem statement
- Method summary
- Key results (with numbers, when present)
- Limitations
- 3 likely viva/defense questions

**2. Ask Your Library (RAG)** — ask a question across a small folder of
papers (`sample_papers/`). The app retrieves the most relevant chunks using
TF-IDF cosine similarity, then asks Claude to answer **using only those
excerpts**, citing which file each fact came from. No hallucinated sources.

## Tech stack

- **Backend:** Python, Flask
- **LLM:** Anthropic Claude API (`claude-sonnet-4-5`)
- **Retrieval:** scikit-learn TF-IDF + cosine similarity (no external vector
  DB needed — fast and dependency-light for a project this size)
- **PDF parsing:** pypdf
- **Frontend:** plain HTML/CSS/JS (no framework, keeps the demo simple)

## Prompt design approach

- The digest prompt uses a **system prompt** that explicitly forbids
  inventing numbers or citations not present in the source text, and
  instructs the model to say "Not stated in provided text" instead of
  guessing — this was the single biggest accuracy improvement during
  testing (early versions without this line occasionally fabricated
  metrics).
- The output schema is given to the model as an explicit JSON template
  in the prompt, not just described in prose — this made outputs far more
  consistently parseable.
- The RAG prompt is **grounding-first**: the model is told to answer only
  from the provided excerpts and to say so if the excerpts don't cover the
  question, rather than falling back on its own training knowledge.

## Setup

```bash
git clone <your-repo-url>
cd research-digest-assistant
pip install -r requirements.txt
cp .env.example .env      # then paste your ANTHROPIC_API_KEY into .env
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

## Test inputs used

1. Pasted abstract of the ResNet-50 deepfake detection paper (`sample_papers/paper1_resnet_deepfake.txt`)
2. Uploaded the EfficientNet paper as a `.txt` file
3. Uploaded a real FYP-related PDF excerpt
4. RAG question: *"Which papers use ResNet-50?"*
5. RAG question: *"What is the Dice score for flood segmentation?"* (tests that retrieval correctly ignores unrelated deepfake papers)

All five produced correctly structured, non-hallucinated output.

## What I'd improve with more time

- Swap TF-IDF retrieval for real sentence embeddings (e.g. Voyage or
  OpenAI embeddings) for better semantic matching beyond keyword overlap
- Let users upload directly into the library from the UI instead of
  dropping files into `sample_papers/` manually
- Add a "compare 2 papers" mode that produces a side-by-side table
- Cache digests so re-uploading the same paper doesn't re-call the API
- Add basic auth + rate limiting before any real deployment

## Author

Aafia — Computer Systems Engineering, Sukkur IBA University
GitHub: [aafia1](https://github.com/aafia1)
