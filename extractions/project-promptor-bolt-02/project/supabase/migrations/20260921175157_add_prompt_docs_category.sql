/*
# PromptOR: categorise the library so roles can be surfaced separately

1. Modified Tables
- `prompt_docs` gains a `category` column (text, default 'instruction').
  - Values: 'role', 'context', 'instruction', 'constraint', 'midtask'
  - This lets the app show Role presets in their own prominent picker
    instead of mixing them into a generic library list.
2. Backfill
- Existing rows are categorised from their topic/kind/title. Rows that already
  have a category keep it, so re-running is safe.
3. Indexes
- Adds a lookup index on (kind, category).
4. Security
- No policy changes; existing RLS on `prompt_docs` still applies.
*/

ALTER TABLE prompt_docs
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'instruction';

UPDATE prompt_docs SET category = CASE
  WHEN kind = 'midtask' THEN 'midtask'
  WHEN title IN ('Thoughtful editor','Senior product engineer','Research analyst','Design critic') THEN 'role'
  WHEN topic = 'Context' THEN 'context'
  WHEN topic = 'Constraints' THEN 'constraint'
  WHEN topic = 'Instructions' THEN 'instruction'
  ELSE 'instruction'
END
WHERE category = 'instruction';

CREATE INDEX IF NOT EXISTS prompt_docs_kind_category_idx
  ON prompt_docs (kind, category);
