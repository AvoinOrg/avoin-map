#!/usr/bin/env node

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parseArgs = (argv) => {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
};

const toFileSafeTimestamp = (value) =>
  value.replace(/\.\d{3}Z$/, 'Z').replace(/:/g, '-');

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const buildPlanTemplate = ({ chatId, timestamp, title, folderName }) => `# Implementation Plan

## Chat Metadata

- Chat id: \`${chatId}\`
- Created at: \`${timestamp}\`
- Folder: \`${folderName}\`
- Title slug: \`${title}\`

## Task Summary

TODO

## Current Authoritative Instructions

TODO

## Relevant Inputs

TODO

## Existing Implementation Snapshot

TODO

## Target Behavior And UX States

TODO

## File And Code-Path Impact

TODO

## Step-By-Step Implementation Plan

TODO

## Translation And Copy Considerations

TODO

## Verification Plan

TODO

## Risks, Assumptions, And Open Questions

TODO

## Status

Planning only. No implementation has been started.
`;

const buildHistoryTemplate = ({ chatId, timestamp, title, folderName }) => `# Chat History

## Chat Metadata

- Chat id: \`${chatId}\`
- Created at: \`${timestamp}\`
- Folder: \`${folderName}\`
- Title slug: \`${title}\`

## User Prompt Log

## Questions And Answers

## Per-Prompt Planning Summaries
`;

const args = parseArgs(process.argv);
const baseDir = resolve(process.cwd(), args['base-dir'] ?? '.tmp');
const titleInput = args.title ?? 'plan';
const titleSlug = slugify(titleInput) || 'plan';
const timestamp = toFileSafeTimestamp(args.timestamp ?? new Date().toISOString());
const chatId = args.id ?? randomBytes(4).toString('hex');
const folderName = `chat-${timestamp}-${chatId}-${titleSlug}`;
const chatDir = resolve(baseDir, folderName);
const planFile = resolve(chatDir, 'plan.md');
const historyFile = resolve(chatDir, 'history.md');

mkdirSync(chatDir, { recursive: true });

if (!existsSync(planFile)) {
  writeFileSync(
    planFile,
    buildPlanTemplate({
      chatId,
      timestamp,
      title: titleSlug,
      folderName,
    }),
    'utf8'
  );
}

if (!existsSync(historyFile)) {
  writeFileSync(
    historyFile,
    buildHistoryTemplate({
      chatId,
      timestamp,
      title: titleSlug,
      folderName,
    }),
    'utf8'
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      chatId,
      timestamp,
      title: titleSlug,
      directory: chatDir,
      planFile,
      historyFile,
    },
    null,
    2
  )}\n`
);
