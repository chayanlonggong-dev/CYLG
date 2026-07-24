# CYLG Production Development Rules

This repository is a real production project, not a demo.

General Rules

- Keep changes minimal and focused.
- Understand the relevant code before editing.
- Never modify unrelated files.
- Never commit or push unless I explicitly ask.
- Never consider a task complete immediately after the code compiles.

Mandatory Validation

After every change:

1. Run npm run build.
2. Fix all build errors.
3. Validate Desktop.
4. Validate iPhone Safari using Playwright.
5. Verify:
   - Home
   - Collection
   - Model Detail
   - Gallery Popup
   - Contact Popup
   - Floating Contact
6. Perform regression testing.
7. Verify touch interactions.
8. Verify scroll restoration.
9. Verify responsive layouts.
10. Provide a final report containing:
   - Files modified
   - Features completed
   - Bugs fixed
   - Build result
   - Validation result
   - Remaining known issues

Always follow this file automatically for future tasks in this repository.
