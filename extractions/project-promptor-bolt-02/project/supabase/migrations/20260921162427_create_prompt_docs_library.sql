/*
# PromptOR: reusable prompt library

1. New Tables
- `prompt_docs`: ready-made prompt fragments shown in the right-hand library
  panel so a user can drop proven rules into a section with one click.
  - `id` (uuid, primary key)
  - `title` (text, not null) - short name shown on the card
  - `topic` (text) - grouping label
  - `kind` ('base' | 'midtask') - which editor tab the fragment belongs to
  - `tags` (text[]) - small labels such as "writing" or "engineering"
  - `content` (text, not null) - newline separated rules, one per line
  - `created_at` (timestamptz)
2. Security
- Enable RLS on `prompt_docs`.
- Public read/write for anon + authenticated; this is a shared, single-tenant
  prototype with no sign-in.
3. Seed
- Insert a starter library of role, context, instruction, constraint and
  mid-task fragments. Guarded so re-running does not duplicate rows.
*/

CREATE TABLE IF NOT EXISTS prompt_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL DEFAULT 'General',
  kind text NOT NULL DEFAULT 'base',
  tags text[] NOT NULL DEFAULT '{}',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prompt_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prompt_docs" ON prompt_docs;
CREATE POLICY "anon_select_prompt_docs" ON prompt_docs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_prompt_docs" ON prompt_docs;
CREATE POLICY "anon_insert_prompt_docs" ON prompt_docs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prompt_docs" ON prompt_docs;
CREATE POLICY "anon_update_prompt_docs" ON prompt_docs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_prompt_docs" ON prompt_docs;
CREATE POLICY "anon_delete_prompt_docs" ON prompt_docs FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS prompt_docs_kind_idx ON prompt_docs (kind);

INSERT INTO prompt_docs (title, topic, kind, tags, content)
SELECT * FROM (VALUES
  ('Thoughtful editor', 'Writing', 'base', ARRAY['writing','editor'],
   E'Act as a thoughtful editor with 10 years of experience in technical writing\nPrefer concrete nouns and active verbs over abstractions\nCut every sentence that does not change the reader''s understanding'),
  ('Senior product engineer', 'Engineering', 'base', ARRAY['engineering','code'],
   E'Act as a senior product engineer who optimises for shipping working software\nAsk for missing requirements before writing code\nExplain tradeoffs in plain language, not jargon'),
  ('Research analyst', 'Analysis', 'base', ARRAY['research','analysis'],
   E'Act as a research analyst who separates evidence from inference\nCite the source of every factual claim\nFlag anything you are uncertain about instead of guessing'),
  ('Design critic', 'Design', 'base', ARRAY['design','ux'],
   E'Act as a design critic who reviews work against user goals, not aesthetics\nName the specific user problem each critique addresses\nRank feedback by impact so the team knows what to fix first'),
  ('Project context', 'Context', 'base', ARRAY['context'],
   E'This work sits inside an existing product with established conventions\nExisting patterns take precedence over new ideas\nDecisions already shipped are out of scope for revision'),
  ('Audience context', 'Context', 'base', ARRAY['context','writing'],
   E'The reader is busy and non-technical\nAssume no prior knowledge of internal systems\nFront-load the conclusion, then support it'),
  ('Technical context', 'Context', 'base', ARRAY['context','engineering'],
   E'The stack is fixed and cannot be swapped for this task\nAssume the codebase already has tests and linting\nTreat public interfaces as contracts'),
  ('Clarify before starting', 'Instructions', 'base', ARRAY['process'],
   E'If any requirement is ambiguous, ask one focused clarifying question before starting\nDo not begin until the goal is unambiguous\nRestate the goal in one sentence before producing output'),
  ('Stay within scope', 'Instructions', 'base', ARRAY['process'],
   E'Only address the exact request — do not expand the task beyond what was asked\nList anything you deliberately left out and why\nDo not add features that were not requested'),
  ('Structure the output', 'Instructions', 'base', ARRAY['format'],
   E'Lead with the answer, then provide supporting detail\nUse short paragraphs and headings rather than long walls of text\nEnd with the single most useful next step'),
  ('No unsolicited refactoring', 'Constraints', 'base', ARRAY['engineering'],
   E'Never refactor code that is not directly related to the current request\nKeep the diff focused on the stated goal\nLeave unrelated files untouched'),
  ('No new dependencies', 'Constraints', 'base', ARRAY['engineering'],
   E'Do not introduce new libraries unless there is no reasonable alternative\nPrefer platform APIs already available in the project\nJustify any dependency you do propose'),
  ('Preserve settled architecture', 'Constraints', 'base', ARRAY['engineering'],
   E'Do not propose changes to decisions that are already finalized\nWork within the existing structure and naming\nAsk before changing a shared interface'),
  ('Concise output', 'Constraints', 'base', ARRAY['format'],
   E'Keep responses under 300 words unless depth is explicitly requested\nNo preamble, no restating the question\nUse bullet points only when the content is genuinely a list'),
  ('Define done', 'Mid-task', 'midtask', ARRAY['process'],
   E'State the acceptance criteria before you start\nCheck the result against each criterion before finishing\nReport anything that could not be verified'),
  ('Ask for approval', 'Mid-task', 'midtask', ARRAY['process'],
   E'Pause after planning and wait for approval before executing\nPresent the plan as numbered steps\nDo not proceed to the next step until told to continue'),
  ('Continue on command', 'Mid-task', 'midtask', ARRAY['process'],
   E'When I say ''next'', continue to the following step without re-explaining\nAssume prior context is retained\nKeep each step self-contained'),
  ('Self-review pass', 'Mid-task', 'midtask', ARRAY['quality'],
   E'After producing output, review it once for accuracy and clarity\nFix anything that is wrong or unclear before responding\nCall out assumptions you had to make')
) AS seed(title, topic, kind, tags, content)
WHERE NOT EXISTS (SELECT 1 FROM prompt_docs);
