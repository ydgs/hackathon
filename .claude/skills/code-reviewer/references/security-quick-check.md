# Security Quick Check

Run this check on every review. It takes 2 minutes. In a hackathon, the most common security mistakes are accidental (hardcoded secrets, open CORS) not malicious — catch them before they reach the demo.

---

## Credentials and Secrets
- [ ] No API keys, tokens, passwords, or connection strings committed to source code
- [ ] No secrets in `.env` files that are not in `.gitignore`
- [ ] Environment-specific values use `.env` variables — check `.env.example` is updated
- [ ] No credentials in comments, log output, or error responses

## Input and Injection
- [ ] User input that reaches a database query is parameterized — no string concatenation into SQL or NoSQL queries
- [ ] User input that reaches a file path is sanitized — no path traversal (`../`)
- [ ] User input used in AI prompts does not allow injection of destructive instructions without validation
- [ ] File uploads (if any) validate file type and size — do not accept arbitrary content

## Data Exposure
- [ ] Error responses do not expose stack traces, internal paths, or raw database errors
- [ ] API responses do not return sensitive fields that are not needed by the frontend (e.g., password hashes, internal IDs used for security decisions)
- [ ] No sensitive data logged to the console or server logs in a way that would be visible in a demo

## CORS and Authentication
- [ ] CORS is not open (`*`) if the application has any authenticated routes
- [ ] If auth is in use, protected routes actually enforce auth — do not rely on the frontend to hide them
- [ ] Authorization assumptions (e.g., "any logged-in user can do X") are explicitly documented in the code or API contract

## Hackathon Rule
Flag serious risks and fix them. Do not block the MVP for enterprise-grade security architecture. The threshold is: would this risk embarrass the team in front of judges, cause data loss, or allow a demo visitor to break the app? If yes, fix it. If no, note it and move on.
