# UI/UX Design

## Layout

```
┌────────────────────────────────────────────────┐
│         FAQ RAG SUPPORT DASHBOARD              │
├────────────────────────────────────────────────┤
│ Input Token: [________________] [Load Data]    │
├────────────────────────────────────────────────┤
│                                                │
│ ┌─────────────────────┐  ┌──────────────────┐  │
│ │  Total Requests: 3  │  │ Escalation Rate: │  │
│ │   Avg Confidence    │  │      0.0%        │  │
│ └─────────────────────┘  └──────────────────┘  │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │  Ask a Question:                           │ │
│ │  [________________] [Send]                 │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │  Question History:                         │ │
│ │ ┌──────────────────────────────────────┐   │ │
│ │ │ Q: How long does shipping take?      │   │ │
│ │ │ A: Standard shipping takes...        │   │ │
│ │ │ Confidence: 100% | Status: Resolved  │   │ │
│ │ │ Time: 9/26/2026 1:27pm               │   │ │
│ │ └──────────────────────────────────────┘   │ │
│ │ ┌──────────────────────────────────────┐   │ │
│ │ │ Q: What is the meaning of life?      │   │ │
│ │ │ A: I'm not sure, let me get a human  │   │ │
│ │ │ Confidence: 0% | Status: Escalated   │   │ │
│ │ │ Time: 9/26/2026 1:56pm               │   │ │
│ │ └──────────────────────────────────────┘   │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

## Colors
- Primary: Dark background
- Cards: Light borders
- Success: Green (resolved)
- Warning: Orange (escalated)
- Text: White/gray

## Interactions
- Type question → Click Send → Response appears in 2-3 seconds
- Auto-refresh shows new historical records every 5 seconds
