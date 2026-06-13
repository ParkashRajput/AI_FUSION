# Unified AI Data Analysis Platform

A platform that automatically detects the type of data you upload and runs the appropriate machine learning pipeline — no configuration required.

---

## What it does

Upload a CSV, image, or text file and the system figures out what to do with it:

- **Sales / numerical data** → regression analysis
- **Customer / segmentation data** → clustering
- **Text data** → NLP classification or sentiment analysis

The pipeline runs automatically (or manually with model selection), generates results, and produces LLM-powered insights — all from a single upload.

---

## Features

- **Auto-detection** — detects task type, target column, and data dtype on upload
- **Manual override** — change target column or task type before running
- **Data preview** — see the first 5 rows with the target column highlighted before committing
- **Auto & manual pipeline modes** — let the system pick the best model, or choose your own
- **LLM-powered insights** — natural language explanation of results, cached so they only generate once
- **Run history** — past runs saved locally with task type, model, and target column
- **Ask questions** — chat with your results after the pipeline completes

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| State | Zustand (`appStore`) |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Icons | Lucide React |
| HTTP client | Axios |
| Backend | Python (FastAPI) |
| ML | scikit-learn |
| LLM insights | Anthropic Claude API |

---

## Project structure

```
/
├── src/
│   ├── api/
│   │   └── index.ts          # All API calls (upload, detect, pipeline, insights)
│   ├── components/
│   │   ├── Nav.tsx
│   │   └── Badge.tsx
│   ├── hooks/
│   │   └── useInsights.ts    # Insight generation + caching logic
│   ├── pages/
│   │   ├── Upload.tsx        # File upload entry point
│   │   ├── Detect.tsx        # Detection results + override + data preview
│   │   ├── Pipeline.tsx      # Pipeline run status
│   │   └── Results.tsx       # Results + insights + Q&A
│   └── store/
│       └── appStore.ts       # Global state (detected, runId, filename, history)
├── backend/
│   ├── main.py               # FastAPI app
│   ├── detect.py             # Data type & task detection logic
│   ├── pipeline.py           # ML pipeline orchestration
│   └── insights.py           # LLM insight generation + caching
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+
- An Anthropic API key (for LLM insights)

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload/` | Upload a file, returns `file_id` |
| `GET` | `/upload/{file_id}/preview` | Returns first 5 rows of uploaded data |
| `POST` | `/detect/` | Detect task type and target column |
| `PATCH` | `/detect/` | Override task type / target column |
| `POST` | `/pipeline/auto` | Run auto pipeline |
| `POST` | `/pipeline/manual` | Run manual pipeline with selected model |
| `GET` | `/pipeline/{run_id}` | Poll pipeline status |
| `GET` | `/models/{task_type}` | List available models for a task type |
| `POST` | `/insights/{run_id}` | Generate LLM insights for a run |
| `GET` | `/insights/{run_id}` | Fetch cached insights |
| `POST` | `/insights/{run_id}/ask` | Ask a follow-up question about results |

---

## Authors & acknowledgements

Built in collaboration by:

| | |
|---|---|
| **Parkash Rajput** | rajputparkash2005@gmail.com |
| **ruvyyyy** | [github.com/ruvyyyy](https://github.com/ruvyyyy/ruvyyyy) |

---

## License

Copyright (c) 2026 Parkash Rajput (rajputparkash2005@gmail.com). All rights reserved.  
See [LICENSE](./LICENSE) for full terms.