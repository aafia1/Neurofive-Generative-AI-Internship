# 🤖 Multi-Agent Basics — Two AIs Working Together

This project demonstrates a simple yet effective **multi-agent AI workflow**, where one AI generates an initial draft and another AI reviews, refines, and improves it. It provides a clean browser-based interface for understanding how multiple AI agents can collaborate to produce higher-quality results.

---

## 📌 Project Overview

Modern AI applications increasingly rely on multiple specialized agents rather than a single prompt-response interaction. This project showcases that concept through a simple two-agent pipeline:

- ✍️ **Writer Agent** – Generates the initial draft based on the user's topic.
- 📝 **Editor Agent** – Reviews, edits, and enhances the draft while preserving its original meaning.

The output of the Writer becomes the input of the Editor, demonstrating a basic form of **AI agent orchestration**.

---

## ✨ Features

- Interactive browser-based interface
- Writer and Editor AI workflow
- Side-by-side draft refinement process
- Displays editing notes and improvements
- Maintains a history of previous runs
- Simple and easy-to-understand implementation

---

## 📂 Project Structure

```text
Week-04/
│
├── README.md
│
└── Multi-Agent Basics- Two AIs Working Together/
    ├── writer-editor-pipeline.html
    ├── writer-editor-pipeline.js
    └── Demo Video.mp4
```

---

## ⚙️ How the Pipeline Works

### ✍️ Writer Agent

The Writer Agent creates the first draft based on the provided topic. Its goal is to quickly generate informative and relevant content.

### 📝 Editor Agent

The Editor Agent reviews the Writer's output and improves it by:

- Enhancing clarity
- Improving sentence structure
- Strengthening introductions and conclusions
- Removing repetitive or unnecessary content
- Preserving the original meaning

This sequential workflow demonstrates how specialized AI agents can collaborate to improve overall output quality.

---

## 🚀 Running the Project

### Option 1: Browser Demo (Recommended)

1. Open **writer-editor-pipeline.html** in any modern web browser.
2. Enter a topic.
3. Click **Run Pipeline**.
4. Review:
   - Writer's Draft
   - Editor's Improved Version
   - Editor's Notes

---

### Option 2: Node.js Version

Initialize Node.js:

```bash
npm init -y
```

Set your Groq API key.

**Windows (PowerShell)**

```powershell
$env:GROQ_API_KEY="your_api_key"
```

**Mac/Linux**

```bash
export GROQ_API_KEY="your_api_key"
```

Run the project:

```bash
node writer-editor-pipeline.js "The Future of Artificial Intelligence"
```

---

## 📊 Technologies Used

- HTML5
- JavaScript (ES6)
- Node.js
- Groq API
- Prompt Engineering
- Multi-Agent AI Workflow

---

## 🎯 Learning Outcomes

Through this project, I learned:

- Multi-agent AI orchestration
- Role-based prompt engineering
- Sequential AI workflows
- Prompt chaining
- Draft-review pipelines
- Browser-based AI interfaces

---

## 🎥 Demo

The repository also includes a demonstration video showcasing the Writer and Editor agents collaborating on different topics.

---

## 🌐 Live Demo

Once GitHub Pages is enabled, the live project will be available here:

**https://aafia1.github.io/Neurofive-Generative-AI-Internship/Week-04/writer-editor-pipeline.html**

---

## Acknowledgement

Developed as part of the **Neurofive Generative AI & Prompt Engineering Internship** to explore the fundamentals of multi-agent AI systems and collaborative prompt engineering.
