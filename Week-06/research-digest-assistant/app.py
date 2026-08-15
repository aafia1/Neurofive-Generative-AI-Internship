
import os
import json
import glob
from pathlib import Path

from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from google import genai

load_dotenv()

app = Flask(__name__)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

MODEL_CANDIDATES = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash",
]
LIBRARY_DIR = Path(__file__).parent / "sample_papers"

# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------

def extract_text_from_pdf(file_storage) -> str:
    reader = PdfReader(file_storage)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150):
    """Simple sliding-window chunker (character-based, good enough for TF-IDF)."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return [c.strip() for c in chunks if c.strip()]


def load_library():
    """Load every .txt/.pdf in sample_papers/ into (filename, chunk) pairs."""
    docs = []  # list of {"source": filename, "text": chunk}
    for path in glob.glob(str(LIBRARY_DIR / "*")):
        p = Path(path)
        if p.suffix.lower() == ".txt":
            text = p.read_text(encoding="utf-8", errors="ignore")
        elif p.suffix.lower() == ".pdf":
            with open(p, "rb") as f:
                text = extract_text_from_pdf(f)
        else:
            continue
        for chunk in chunk_text(text):
            docs.append({"source": p.name, "text": chunk})
    return docs


def retrieve(query: str, docs: list, top_k: int = 4):
    """TF-IDF cosine-similarity retrieval — no external embedding API needed."""
    if not docs:
        return []
    corpus = [d["text"] for d in docs]
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(corpus + [query])
    query_vec = matrix[-1]
    doc_vecs = matrix[:-1]
    sims = cosine_similarity(query_vec, doc_vecs).flatten()
    ranked = sorted(zip(sims, docs), key=lambda x: x[0], reverse=True)
    return [d for score, d in ranked[:top_k] if score > 0]

def call_gemini(contents: str, system_instruction: str, max_output_tokens: int, json_mode: bool = False):
    """Try each candidate model until one responds successfully."""
    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            config = {
                "system_instruction": system_instruction,
                "max_output_tokens": max_output_tokens,
            }
            if json_mode:
                config["response_mime_type"] = "application/json"
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            if not response.text:
                raise ValueError(f"{model_name} returned empty text (likely truncated by max_output_tokens)")
            return response
        except Exception as e:
            last_error = e
            continue
    raise last_error
# ----------------------------------------------------------------------
# Prompt design
# ----------------------------------------------------------------------

DIGEST_SYSTEM_PROMPT = """You are a meticulous research assistant helping an \
engineering student prepare for a thesis defense / viva. You read academic \
paper text and produce a structured digest. You NEVER invent results, \
numbers, or citations that are not present in the given text — if something \
is not stated, use "Not stated in provided text". Respond with ONLY valid \
JSON matching the schema you are given. No markdown fences, no preamble."""

DIGEST_JSON_SCHEMA = """{
  "title": "string - the paper's title, or 'Untitled' if not found",
  "problem_statement": "1-2 sentence summary of the problem the paper addresses",
  "method": "2-3 sentence summary of the approach/architecture/technique used",
  "key_results": ["short bullet strings with concrete numbers/metrics where available"],
  "limitations": ["short bullet strings — stated or clearly implied weaknesses"],
  "viva_questions": ["3 sharp follow-up questions a thesis panel might ask about this work"]
}"""


def build_digest_prompt(paper_text: str) -> str:
    # Keep prompt within a reasonable token budget for long papers
    trimmed = paper_text[:12000]
    return f"""Here is the text of a research paper (may be truncated):

<paper>
{trimmed}
</paper>

Produce a digest as a JSON object matching exactly this schema:
{DIGEST_JSON_SCHEMA}

Return ONLY the JSON object."""


LIBRARY_SYSTEM_PROMPT = """You are a research librarian. Answer the user's \
question using ONLY the provided excerpts. If the excerpts don't contain \
the answer, say so plainly instead of guessing. Always cite which source \
file each piece of your answer came from, e.g. "(source: paper1.txt)"."""


def build_library_prompt(question: str, retrieved: list) -> str:
    context_blocks = "\n\n".join(
        f"[Source: {d['source']}]\n{d['text']}" for d in retrieved
    )
    return f"""Question: {question}

Relevant excerpts from the paper library:

{context_blocks}

Answer the question using only these excerpts, and cite sources by filename."""


# ----------------------------------------------------------------------
# Routes
# ----------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/digest", methods=["POST"])
def digest():
    paper_text = ""

    if "file" in request.files and request.files["file"].filename:
        f = request.files["file"]
        if f.filename.lower().endswith(".pdf"):
            paper_text = extract_text_from_pdf(f)
        else:
            paper_text = f.read().decode("utf-8", errors="ignore")
    else:
        paper_text = request.form.get("paper_text", "") or (request.json or {}).get("paper_text", "")

    if not paper_text.strip():
        return jsonify({"error": "No paper text or file provided."}), 400

    try:
        response = call_gemini(build_digest_prompt(paper_text), DIGEST_SYSTEM_PROMPT, 2500, json_mode=True)
    except Exception as e:
        return jsonify({"error": f"All Gemini models failed: {e}"}), 500

    raw = response.text.strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        print("----- RAW MODEL OUTPUT (not valid JSON) -----")
        print(raw)
        print("----- END RAW OUTPUT -----")
        return jsonify({"error": "Model did not return valid JSON.", "raw": raw}), 500

    return jsonify(parsed)


@app.route("/api/ask-library", methods=["POST"])
def ask_library():
    data = request.get_json(force=True)
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "No question provided."}), 400

    docs = load_library()
    retrieved = retrieve(question, docs, top_k=4)

    if not retrieved:
        return jsonify({"answer": "No papers in the library yet — add .txt or .pdf files to sample_papers/.", "sources": []})

    try:
       response = call_gemini(build_library_prompt(question, retrieved), LIBRARY_SYSTEM_PROMPT, 1000)
    except Exception as e:
        return jsonify({"error": f"All Gemini models failed: {e}"}), 500

    answer = response.text.strip()
    sources = sorted({d["source"] for d in retrieved})
    return jsonify({"answer": answer, "sources": sources})


if __name__ == "__main__":
    app.run(debug=True)