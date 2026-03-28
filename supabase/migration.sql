-- KiwiStays Investor CRM — Supabase Tables
-- Run this in the Supabase SQL Editor

-- ============ INVESTORS TABLE ============
CREATE TABLE IF NOT EXISTS investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  fund TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Identified',
  priority TEXT NOT NULL DEFAULT 'P3',
  category TEXT,
  contact TEXT,
  intro TEXT,
  email_date TEXT,
  meeting_date TEXT,
  next_action TEXT,
  next_date TEXT,
  notes TEXT,
  ticket_size TEXT,
  why_fit TEXT,
  conflict_check TEXT,
  fund_stage TEXT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ MESSAGES TABLE ============
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investor TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'LinkedIn DM',
  status TEXT NOT NULL DEFAULT 'Draft',
  subject TEXT,
  body TEXT NOT NULL,
  notes TEXT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ RLS (open for now — add auth later) ============
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations (open access — tighten after auth is added)
CREATE POLICY "Allow all on investors" ON investors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_investors_stage ON investors(stage);
CREATE INDEX IF NOT EXISTS idx_investors_priority ON investors(priority);
CREATE INDEX IF NOT EXISTS idx_investors_updated ON investors(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
