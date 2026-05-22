# Azure DevOps User Story Template

## Title
US-###: [Verb] [business object]

## Description
As a [user type],
I want to [perform action],
so that [business value].

## Priority
P0 / P1 / P2

## Acceptance Criteria
Use **Given/When/Then** format for every criterion.

- [ ] Given [precondition], when [user action], then [expected system outcome]
- [ ] Given [required field is empty], when [user submits], then [system shows error and blocks submission]
- [ ] Given [error condition], when [action is triggered], then [user sees specific error message]

## Business Rules
- Rule 1
- Rule 2

## API Contract Hints
High-level hints for the solution-architect. Full contract goes in `docs/api-conventions.md`.

- Endpoint: TBD
- Request body: TBD (field: type, required/optional)
- Success response: TBD (status code + key fields)
- Error cases: TBD (condition → status code)

## UI Expectations
- Page/component: TBD
- States: loading, empty, success, error

## Tasks
- [FE] ...
- [BE] ...
- [QA] ...

## Definition of Done
- [ ] FE complete, if applicable
- [ ] BE complete, if applicable
- [ ] Integrated end-to-end
- [ ] QA validated
- [ ] No blocker/high bugs
- [ ] Code pushed to Azure Repos
