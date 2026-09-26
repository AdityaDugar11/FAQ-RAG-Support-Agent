# Product Requirements Document (PRD)

## Overview
Interactive dashboard for FAQ RAG support agent. Users ask questions, n8n processes them, dashboard displays results in real-time.

## Features

### 1. Historical Data View
- Load Airtable records on page open
- Display last 20 Q&A pairs
- Show confidence score and escalation status
- Sort by most recent first
- Auto-refresh every 5 seconds

### 2. Question Input
- Text input field for new question
- Send button to execute workflow
- Clear button to reset form
- Loading indicator while waiting for response

### 3. Real-time Results
- Display answer immediately after n8n returns it
- Show confidence score
- Show escalation status (Resolved/Escalated)
- Add new result to history

### 4. Metrics Display
- Total questions asked (from Airtable)
- Escalation rate (% of escalated)
- Average confidence score
- Requests today

### 5. Authentication
- Airtable API token input field
- Load Data button to fetch historical records
- No hardcoded secrets

## Non-Functional Requirements
- Fast: Load in <2 seconds
- Responsive: Works on desktop and mobile
- Secure: No API keys in code
- Accessible: Readable fonts, good contrast

## Success Metrics
- Historical data loads in <1 second
- New question answered in <3 seconds
- Zero broken links or 404s
- 100% uptime on Vercel