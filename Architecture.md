# System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD (Frontend)                 │
│  - Input field for new questions                        │
│  - Historical data table from Airtable                  │
│  - Real-time results as they come back                  │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   ┌──────────┐          ┌──────────────┐
   │ Airtable │          │ n8n Webhook  │
   │  (Read)  │          │  (Execute)   │
   └────┬─────┘          └──────┬───────┘
        │                       │
        │          ┌────────────┴─────────────┐
        │          │                          │
        │          ▼                          ▼
        │     ┌──────────────┐          ┌──────────────┐
        │     │ LLM (Groq)   │          │ Log Result   │
        │     │              │          │ to Airtable  │
        │     └──────────────┘          └────────┬─────┘
        │                                         │
        └─────────────────┬───────────────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │  Airtable DB │
                    │  (Updated)   │
                    └──────────────┘
```

## Components

1. **Frontend (HTML/CSS/JS)**
   - Input form for questions
   - Historical table from Airtable
   - Real-time response display
   - Auto-refresh on new data

2. **n8n Workflow**
   - Receives POST from dashboard
   - Executes FAQ RAG logic
   - Logs to Airtable
   - Returns answer to frontend

3. **Airtable Base**
   - Stores all Q&A with metadata
   - Used as source of truth
   - Read by dashboard every 5 sec

## API Calls

- **Dashboard → Airtable:** GET (fetch records)
- **Dashboard → n8n:** POST (send question)
- **n8n → Airtable:** INSERT (log response)