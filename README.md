# Luminary Outreach

Luminary Outreach is the email writing and outreach pipeline data place for Luminary Labs.

It is meant to hold the working structure for writing, reviewing, organizing, and improving outreach campaigns.

## Purpose

This repository is for building a repeatable outreach system, not a one-off email dump.

It should support:

- outreach campaign planning
- email copy drafts
- lead list organization
- source tracking
- audience segmentation
- send-readiness checks
- reply handling notes
- follow-up sequencing
- campaign performance learning

## Core idea

Every outreach run should leave useful structure behind.

The repo should make it easier to move from:

```txt
raw lead idea -> researched contact -> segmented list -> written email -> reviewed copy -> sent campaign -> reply notes -> improved next campaign
```

## Suggested structure

```txt
campaigns/
  campaign-name/
    brief.md
    audience.md
    email-drafts.md
    followups.md
    send-checklist.md
    results.md

data/
  leads/
  sources/
  segments/

templates/
  cold-email.md
  follow-up.md
  reply-handling.md
  compliance-checklist.md

scripts/
  README.md
```

## Outreach standards

Outreach data should be public-source, relevant, and reviewable.

Email writing should be clear, specific, and honest.

Campaigns should include opt-out language when used for commercial cold email.

Lead records should keep source context when available.

No guessed personal emails should be treated as verified.

## Useful campaign record fields

A strong lead or contact record should track:

- person or organization name
- role or relevance
- company / school / institution
- public source URL
- email or contact method
- confidence level
- campaign segment
- last contacted date
- reply status
- notes

## Status

Initial outreach README.

Next steps are to add campaign folders, templates, and lightweight data schemas for repeatable outreach work.
