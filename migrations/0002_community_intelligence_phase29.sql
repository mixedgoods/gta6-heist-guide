-- Phase 29: Leonida Community Intelligence Network — Additive D1 Migration
-- NON-DESTRUCTIVE: Only CREATE TABLE/INDEX IF NOT EXISTS on new cd_* tables.
-- Preserves all existing tables, triggers, constraints, and production rows untouched.
-- Rollback:
--   DROP TABLE IF EXISTS cd_reports;
--   DROP TABLE IF EXISTS cd_verification_meta;

CREATE TABLE IF NOT EXISTS cd_verification_meta (
  submission_id INTEGER PRIMARY KEY REFERENCES cd_submissions(id),
  official_confirmed INTEGER NOT NULL DEFAULT 0,
  authoritative_source_url TEXT,
  authoritative_source_label TEXT,
  evidence_source_summary TEXT,
  verification_notes TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  related_db_records TEXT,
  moderated_at TEXT,
  moderated_by TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cd_vmeta_featured ON cd_verification_meta(featured, moderated_at);

CREATE TABLE IF NOT EXISTS cd_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cd_reports_ref ON cd_reports(ref, created_at);
