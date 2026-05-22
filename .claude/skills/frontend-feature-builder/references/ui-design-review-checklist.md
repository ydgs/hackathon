# UI Design Review Checklist

Use this checklist after implementing visible frontend screens, especially demo-critical screens.

## Visual Hierarchy
- [ ] The primary action is obvious within 3 seconds.
- [ ] Important data has stronger visual weight than secondary data.
- [ ] Cards, tables, panels, and actions are grouped logically.
- [ ] The screen has a clear top-to-bottom reading flow.

## Product-Specific Design
- [ ] The screen matches `docs/design/impeccable-context.md`.
- [ ] The UI does not look like a generic SaaS template.
- [ ] Icons, colors, and motion support the product story.
- [ ] The design feels consistent with other screens.

## Typography
- [ ] Page titles, headings, labels, metadata, and body text are visually distinct.
- [ ] Dense information is easy to scan.
- [ ] Text sizes are consistent with the design system.
- [ ] Important status messages are readable during a live demo.

## Spacing and Layout
- [ ] Spacing is consistent across similar components.
- [ ] Alignment is clean and intentional.
- [ ] The screen has enough whitespace.
- [ ] Responsive behavior works on expected screen sizes.

## States
- [ ] Loading state is present and clear.
- [ ] Empty state explains what happens next.
- [ ] Error state is understandable and recoverable.
- [ ] Success state gives clear feedback.

## Accessibility
- [ ] Contrast is acceptable.
- [ ] Interactive elements have visible focus states.
- [ ] Buttons and links have clear labels.
- [ ] Visual meaning is not communicated by color alone.

## Demo Readiness
- [ ] The screen looks good on a projector or shared screen.
- [ ] The main story can be explained quickly.
- [ ] No placeholder text is visible unless intentionally marked.
- [ ] Mock data is realistic and clearly labelled in code.
