# 📄 Research Digest & Literature Review Assistant

> A capstone mini-app for Week 6 — Generative AI & Prompt Engineering.
> Combines prompt design, structured JSON output, and a lightweight RAG
> pipeline into one working tool for reading research papers faster.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-black)
![Gemini API](https://img.shields.io/badge/LLM-Gemini%20API-8E75B2)

---

## The problem

Prepping for a thesis defense (or just keeping a literature review organized)
means re-reading the same papers and manually re-extracting the same five
things every time: what problem it solves, how, what it found, where it
falls short, and what a panel might grill you on. This app automates that
first pass, and adds a way to ask questions across a whole folder of papers
at once — grounded in the actual text, not the model's memory.

## What it does
### Full app view
*App overview showing the digest form and generated output* <img width="800" height="580" alt="1" src="https://github.com/user-attachments/assets/4d47c393-61d4-47a2-8b53-7b73d21cd1b9" />


### 1. Paper Digest
Paste text or upload a PDF/TXT of a paper. The app sends it to Gemini with
a strict JSON schema and returns a structured summary:
- Problem statement
- Method summary
- Key results (with numbers, when present)
- Limitations
- 3 likely viva/defense questions

<!-- paste your digest screenshot below -->
*Paper digest output showing structured summary* <img width="817" height="636" alt="2" src="https://github.com/user-attachments/assets/f7322a1b-4f23-4ed3-9cd7-c4e71e7f7378" />


### 2. Ask Your Library (RAG)
Ask a question across a small folder of papers (`sample_papers/`). The app:
1. Chunks every paper in the library
2. Retrieves the most relevant chunks using TF-IDF + cosine similarity
3. Asks Gemini to answer **using only those excerpts**, citing which file
   each fact came from

No vector database, no hallucinated sources — if the library doesn't cover
the question, the model says so instead of guessing.

<!-- paste your RAG screenshot below -->
*RAG answer citing the correct source paper* <img width="834" height="377" alt="3" src="https://github.com/user-attachments/assets/3f126e45-82bb-4699-8cb2-0310daa224f7" />


**Example — proving retrieval actually discriminates on content:**

> **Q:** "Which papers use ResNet-50?"
> **A:** Only cites the ResNet-50 deepfake detection paper — correctly
> excludes a paper using a different pretrained CNN encoder (EfficientNetB4)
> for an unrelated task (flood segmentation), even though both are
> "pretrained CNN backbone" papers on the surface.

## Tech stack

| Layer       | Choice                                                   |
|-------------|-----------------------------------------------------------|
| Backend     | Python, Flask                                              |
| LLM         | Google Gemini API    |
| Retrieval   | scikit-learn TF-IDF + cosine similarity (no external vector DB) |
| PDF parsing | pypdf                                                      |
| Frontend    | Plain HTML/CSS/JS — no framework                            |

## Prompt design approach

- **Anti-hallucination system prompt.** The digest prompt explicitly forbids
  inventing numbers or citations not present in the source text, and
  instructs the model to say *"Not stated in provided text"* instead of
  guessing. This was the single biggest accuracy improvement during
  testing — earlier versions without this line occasionally fabricated
  metrics.
- **Schema-in-prompt, not schema-in-prose.** The output JSON structure is
  given to the model as an explicit template inside the prompt, combined
  with Gemini's structured-output mode (`response_mime_type: application/json`).
  This made outputs reliably parseable instead of intermittently wrapped in
  markdown fences or preamble text.
- **Grounding-first RAG prompt.** The library Q&A prompt tells the model to
  answer *only* from the provided excerpts, and to say so plainly if the
  excerpts don't cover the question, rather than falling back on its own
  training knowledge.
- **Model fallback chain.** Gemini's available model names change
  frequently as new versions ship and older ones are retired for new
  accounts. The app tries a short list of current model names in order and
  uses the first one that responds successfully, so it doesn't break
  outright when a single model name is deprecated.

## Setup

```bash
git clone https://github.com/aafia1/Neurofive-Generative-AI-Internship.git
cd Neurofive-Generative-AI-Internship/Week-06/research-digest-assistant

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # then paste your GEMINI_API_KEY into .env
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

Get a free Gemini API key (no credit card required) at
[aistudio.google.com](https://aistudio.google.com) → **Get API key**.

## Testing

Tested with 5 realistic inputs, all producing correctly structured,
non-hallucinated output:

1. Pasted abstract of a ResNet-50 deepfake detection paper
2. Uploaded a second deepfake paper (EfficientNet-B4) as a `.txt` file
3. Uploaded a real excerpt from my own Final Year Project paper
4. RAG: *"Which papers use ResNet-50?"* → correctly isolates the one relevant paper
5. RAG: *"What is the Dice score for flood segmentation?"* → correctly retrieves from an unrelated-domain paper in the library, proving retrieval isn't just topic-matching

## What I'd improve with more time

- Swap TF-IDF retrieval for real sentence embeddings for better semantic
  matching beyond keyword overlap
- Let users add papers to the library directly from the UI instead of
  dropping files into `sample_papers/` manually
- Add a "compare 2 papers" mode with a side-by-side table
- Cache digests so re-uploading the same paper doesn't re-call the API
- Add basic auth + rate limiting before any real deployment

## Author

**Aafia** — Computer Systems Engineering, Sukkur IBA University
GitHub: [@aafia1](https://github.com/aafia1)
