# Technical Decisions

## 1. Why Airtable for historical data?
- **Decision:** Pull historical data from Airtable, not n8n
- **Reason:** Airtable is the persistent source of truth
- **Alternative Considered:** Query n8n execution logs (too complex)

## 2. Why auto-refresh every 5 seconds?
- **Decision:** Poll Airtable every 5 sec for new records
- **Reason:** Shows new answers as soon as n8n logs them
- **Alternative Considered:** Webhook push from n8n (more complex)

## 3. Why separate HTML/CSS/JS files?
- **Decision:** Modular structure
- **Reason:** Easy to maintain, deploy, test separately
- **Alternative Considered:** Single HTML file (less maintainable)

## 4. Why no backend?
- **Decision:** All logic in browser (fetch API calls)
- **Reason:** Simpler deployment, cheaper hosting, faster
- **Alternative Considered:** Node.js backend (unnecessary complexity)

## 5. Why Airtable token at runtime (not hardcoded)?
- **Decision:** User pastes token into dashboard input
- **Reason:** Security - token never in public code
- **Alternative Considered:** Store in .env (exposed in build)