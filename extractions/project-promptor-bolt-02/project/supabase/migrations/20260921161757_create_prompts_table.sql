/*
# PromptOR: prompt builder persistence

1. New Tables
- `prompts`: one saved prompt document per row.
  - `id` (uuid, primary key)
  - `title` (text, not null, default 'Untitled prompt')
  - `base_sections` (jsonb array of {id, name, colorKey, collapsed, points[]})
  - `midtask_sections` (jsonb array of {id, name, colorKey, collapsed, points[]})
  - `created_at`, `updated_at` (timestamps)
  - Columns store each editor tab's whole structure, so the prototype can
    save/load without joins while keeping each row self-contained.
2. Security
- Enable RLS on `prompts`.
- Allow anon + authenticated full CRUD because this is a single-tenant
  prototype with no sign-in; all visitors edit the shared workspace.
*/

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled prompt',
  base_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  midtask_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prompts" ON prompts;
CREATE POLICY "anon_select_prompts" ON prompts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_prompts" ON prompts;
CREATE POLICY "anon_insert_prompts" ON prompts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prompts" ON prompts;
CREATE POLICY "anon_update_prompts" ON prompts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_prompts" ON prompts;
CREATE POLICY "anon_delete_prompts" ON prompts FOR DELETE
TO anon, authenticated USING (true);

ALTER TABLE prompts REPLICA IDENTITY FULL;
