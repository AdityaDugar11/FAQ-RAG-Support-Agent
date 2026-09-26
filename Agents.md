# Agents in the System

## 1. FAQ RAG Agent (n8n)
- **Role:** Process customer questions, retrieve FAQ context, generate answers
- **Input:** Customer message via webhook
- **Output:** Answer + confidence score
- **Actions:**
  - Retrieves relevant FAQ from knowledge base (keyword search)
  - Calls Groq LLM to generate response
  - Rates confidence (0-1)
  - Logs to Airtable
  - Escalates to Slack if confidence < 0.7

## 2. Dashboard Agent (Browser)
- **Role:** Display FAQ data, accept new questions, execute n8n workflow
- **Input:** Airtable historical data + user questions
- **Output:** Chat-like interface with real-time data
- **Actions:**
  - Fetches historical records from Airtable on load
  - Sends new questions to n8n webhook
  - Displays responses immediately
  - Polls Airtable for new records (auto-refresh every 5 sec)

## 3. Airtable Storage Agent
- **Role:** Persistent data store
- **Data:** Question, answer, confidence, escalated status, timestamp
- **Queries:** Read by dashboard, written by n8n