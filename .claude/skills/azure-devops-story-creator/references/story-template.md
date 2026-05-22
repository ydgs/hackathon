# Azure DevOps User Story Template

Use this format for every User Story work item. Fill in every section. Write "N/A" if a section genuinely does not apply — do not leave sections blank.

---

## Title
`[Verb] [business object]`

Do not add a manual ID prefix. Azure DevOps assigns the ID automatically when the work item is created via the MCP server. After creation, record the assigned ID in `docs/project-context.md` next to the story title.

Examples:
- Submit a new request
- View the request list
- Approve a pending request

---

## Description
Write in HTML format — Azure DevOps renders HTML in the description field. Do not use Markdown.

```html
<p>As a [type of user],<br>
I want to [perform a specific action],<br>
so that [concrete business value].</p>

<p><strong>Acceptance Criteria:</strong></p>
<ul>
  <li>Given [precondition], when [user action], then [expected system outcome]</li>
  <li>Given [required field is empty], when [user submits], then [system shows "[Field] is required" and blocks submission]</li>
  <li>Given [API error], when [action is triggered], then [user sees a specific error message]</li>
</ul>

<p><strong>API Contract Hints:</strong></p>
<ul>
  <li>Endpoint: [METHOD] /api/[resource]</li>
  <li>Request: [field: type (required/optional)], ...</li>
  <li>Success: [status code] — [key response fields]</li>
  <li>Errors: [condition] → [status code]</li>
</ul>
```

Example:
```html
<p>As a procurement officer,<br>
I want to submit a new purchase request with title, amount, and justification,<br>
so that my manager can review and approve it.</p>

<p><strong>Acceptance Criteria:</strong></p>
<ul>
  <li>Given valid input, when the officer submits the form, then the request appears in the list with status Pending.</li>
  <li>Given an empty title, when the officer submits, then the system displays "Title is required" and prevents submission.</li>
  <li>Given a negative amount, when the officer submits, then the system displays "Amount must be greater than zero".</li>
</ul>

<p><strong>API Contract Hints:</strong></p>
<ul>
  <li>Endpoint: POST /api/requests</li>
  <li>Request: title (string, required), amount (number, required), justification (string, optional)</li>
  <li>Success: 201 — returns { id, status: "Pending", createdAt }</li>
  <li>Errors: missing title → 400, negative amount → 400</li>
</ul>
```

---

## Priority
`P0 / P1 / P2`

| Value | DevOps Priority Field | Meaning | Target phase |
|-------|-----------------------|---------|-------------|
| P0 | 1 | Required for the demo to make sense | Done by hour 8 |
| P1 | 2 | Makes the product credible or useful | Done by hour 13 |
| P2 | 3 | Stretch / wow feature | Start only after hour 14 |

See `references/priority-rules.md` for full rules.

---

## Effort Estimate
`S / M / L`

| Value | Meaning | Action |
|-------|---------|--------|
| S | < 2 hours | Proceed |
| M | 2–4 hours | Proceed |
| L | > 4 hours | Flag for splitting before starting |

---

## Demo Impact
What does a judge see on screen when this story is complete?

Example: "Judge clicks 'New Request', fills the form, submits — sees the request appear in the list with 'Pending' status."

---

## Acceptance Criteria
Each criterion must be in **Given/When/Then** format and independently testable with a clear pass/fail. These are also written in the Description field (HTML) when pushing to DevOps — use `Microsoft.VSTS.Common.AcceptanceCriteria` field if your process template exposes it.

Format: **Given** [precondition or system state], **When** [user action or trigger], **Then** [expected system outcome].

- [ ] Given [valid input], when [user submits], then [system saves and displays success]
- [ ] Given [required field is empty], when [user submits], then [system shows "[Field] is required" and blocks submission]
- [ ] Given [data is saved], when [user refreshes the page], then [data is still visible]
- [ ] Given [API or server error], when [action is triggered], then [user sees a specific error message and can retry]

---

## Business Rules
- [Specific constraint or rule the implementation must enforce]
- Example: "Amount must be a positive number. Requests above 10,000 require a second-level approval flag."

---

## Dependencies
- **Blocked by stories:** [ID assigned by DevOps after creation] (describe why)
- **API required:** `POST /api/requests` (must be implemented before FE task begins)
- **Data required:** Request entity model confirmed in `docs/architecture.md`
- **Agent dependency:** BE task must be Done before QA task begins

---

## API Contract Hints
High-level hints derived from the product-analyst's analysis. These are inputs for the solution-architect — not the final contract. The full contract is defined in `docs/api-conventions.md`.

- **Endpoint:** `[METHOD] /api/[resource]`
- **Request body:** `[field: type (required/optional)]`, ...
- **Success response:** `[status code]` — `[key fields returned]`
- **Error cases:** `[condition]` → `[status code]`

If the data model is not yet confirmed in `docs/architecture.md`, write "TBD — pending architecture review" for request body and response fields.

---

## Tasks
Create these as child Task work items under this User Story via the MCP server. Title format: `[DISCIPLINE] [action]`. The parent story ID is assigned by DevOps and used to link the child.

```
[FE] Build [screen/component name]
[BE] Implement [endpoint or logic]
[QA] Validate [acceptance criteria reference]
```

---

## Definition of Done
- [ ] Frontend task completed and integrated
- [ ] Backend task completed and tested
- [ ] End-to-end flow works in the running app
- [ ] All acceptance criteria pass
- [ ] No Blocker or High severity bugs open against this story
- [ ] Code reviewed (or self-reviewed under time pressure)
- [ ] Merged into the agreed branch
- [ ] Story transitioned to Done in Azure DevOps by the QA Test Engineer
