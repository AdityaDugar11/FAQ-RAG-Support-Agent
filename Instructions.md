# Setup & Deployment Instructions

## Prerequisites
- Airtable base with FAQ questions table
- n8n workflow deployed (webhook URL ready)
- Airtable API token (from airtable.com/account/personal/tokens)
- Groq API key (configured in n8n)

## Local Setup

1. Create folder: `faq-dashboard/`
2. Create 3 files inside:
   - index.html
   - style.css
   - app.js
3. Open index.html in browser
4. Paste Airtable token into input
5. Click "Load Data"

## File Structure
```
faq-dashboard/
├── index.html
├── style.css
├── app.js
└── vercel.json
```

## Deployment to Vercel

```bash
npm install -g vercel
cd faq-dashboard/
vercel
```

Get live URL: `https://faq-dashboard-xxxxx.vercel.app`

## Environment Variables
None needed. Users paste Airtable token at runtime.

## Testing

1. Load dashboard
2. Paste Airtable token
3. See historical records load
4. Type new question
5. Click Send
6. Wait 2-3 seconds
7. See answer appear
8. Check Airtable - new row should be there

## Troubleshooting

**"No data loads"**
→ Check Airtable token is correct
→ Verify base ID and table ID match

**"Send button doesn't work"**
→ Check webhook URL in app.js
→ Verify x-api-key header is correct
→ Check browser console for errors

**"Answer doesn't appear"**
→ Check n8n workflow is published
→ Check Groq API key is valid
→ Wait 5+ seconds for auto-refresh