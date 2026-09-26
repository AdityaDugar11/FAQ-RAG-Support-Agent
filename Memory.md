# System Memory & State Management

## Frontend State (In-Memory)

```javascript
{
  airtableToken: "user's API token",
  records: [
    {
      message: "How long...",
      answer: "Standard shipping...",
      confidence: 1.0,
      escalated: false,
      timestamp: "2026-09-26T13:27:00Z"
    },
    // ... more records
  ],
  currentQuestion: "User's typed question",
  isLoading: false,
  autoRefreshInterval: 5000 // milliseconds
}
```

## What Gets Stored Where

| Data | Where | Why |
|------|-------|-----|
| Historical Q&A | Airtable | Persistent storage |
| User's token | Browser memory | Session only |
| Current session data | Browser memory | Temporary |
| New question | Browser input field | User typing |

## Auto-Refresh Logic
- Every 5 seconds: Fetch latest records from Airtable
- Compare with existing records
- If new record found: Add to display
- If record count increased: Show "New answer available"

## Clearing Memory
- User closes tab: Browser clears all state
- User clicks "Clear": Reset question input
- User clicks "Load Data": Refetch all records (overwrite)