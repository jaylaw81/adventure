# StoryQuestor — Claude Instructions

## Changelog maintenance

`CHANGELOG.md` (project root) is the canonical feature changelog. **Update it whenever a major feature is shipped.**
`lib/changelog.ts` parses this file at runtime — never edit the `.ts` file to add entries, only edit the markdown.

A "major feature" is anything user-facing: a new page or section, a new editor capability, a new admin tool, a new email flow, a significant UI change, or a behavioral change users would notice. Minor bug fixes and internal refactors do not need changelog entries.

### How to add an entry

1. Open `CHANGELOG.md`.
2. Insert a new `## YYYY-MM-DD` section directly below the `---` separator (newest first).
3. Add one `- ` bullet per feature: **Feature name** followed by a brief plain-English description of what it does for the user.
4. Group all features shipped on the same date into one section.

### Example

```markdown
## 2026-05-25

- Email blast rate limiting: outbound emails are now sent in controlled batches to stay within Resend API limits, preventing delivery failures on large lists.
```

Do not add entries for:
- Dependency upgrades
- TypeScript / lint fixes
- Internal refactors with no user-visible effect
- Admin-only infrastructure changes that users never see
