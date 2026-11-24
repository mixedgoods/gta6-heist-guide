-- Community Discoveries system. NON-DESTRUCTIVE: only CREATE ... IF NOT EXISTS on new cd_* objects.
-- Does not touch any existing table (subscribers, forum_threads, map_markers, live_discoveries, ...).
-- Rollback: DROP the cd_* tables/triggers listed in COMMUNITY-DISCOVERY-SYSTEM-IMPLEMENTATION.md.

CREATE TABLE IF NOT EXISTS cd_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT NOT NULL UNIQUE,                 -- public reference number (random, non-sequential)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_explanation TEXT NOT NULL,
  region TEXT NOT NULL,
  location_description TEXT NOT NULL,
  directions TEXT NOT NULL,
  platform TEXT NOT NULL,
  game_version TEXT,
  discovered_on TEXT NOT NULL,
  witnessed INTEGER NOT NULL,               -- 1 = contributor personally witnessed it
  evidence_description TEXT NOT NULL,
  sources_text TEXT,
  coord_xpct REAL,
  coord_ypct REAL,
  display_name TEXT,
  credit_pref TEXT NOT NULL DEFAULT 'anonymous',
  contact_email TEXT,                       -- PRIVATE. Never returned by public endpoints.
  originality_ack INTEGER NOT NULL,
  license_ack INTEGER NOT NULL,
  image_rights_ack INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  ip_hash TEXT,
  evidence_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW'
    CHECK (evidence_status IN ('PENDING_REVIEW','NEEDS_MORE_EVIDENCE','COMMUNITY_REPORTED','CORROBORATED','INDEPENDENTLY_VERIFIED','REJECTED')),
  reviewer_status TEXT NOT NULL DEFAULT 'new'
    CHECK (reviewer_status IN ('new','in_review','reviewed')),
  duplicate_of INTEGER REFERENCES cd_submissions(id)
);
CREATE INDEX IF NOT EXISTS idx_cd_sub_status ON cd_submissions(evidence_status, created_at);
CREATE INDEX IF NOT EXISTS idx_cd_sub_hash ON cd_submissions(content_hash);
CREATE INDEX IF NOT EXISTS idx_cd_sub_cat ON cd_submissions(category, region);

-- The original contributor-supplied content is immutable (audit requirement).
-- Editorial changes live in cd_published. Only status/review/duplicate/updated_at columns may change.
CREATE TRIGGER IF NOT EXISTS trg_cd_sub_immutable
BEFORE UPDATE OF ref, created_at, category, title, short_description, detailed_explanation, region,
  location_description, directions, platform, game_version, discovered_on, witnessed, evidence_description,
  sources_text, coord_xpct, coord_ypct, display_name, credit_pref, contact_email, originality_ack,
  license_ack, image_rights_ack, content_hash, ip_hash ON cd_submissions
BEGIN
  SELECT RAISE(ABORT, 'cd_submissions original content is immutable');
END;

CREATE TABLE IF NOT EXISTS cd_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES cd_submissions(id),
  kind TEXT NOT NULL CHECK (kind IN ('screenshot_url','video_url','upload')),  -- 'upload' reserved for a future R2 path
  url TEXT,
  domain TEXT,
  created_at TEXT NOT NULL,
  reviewer_checked INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_cd_evid_sub ON cd_evidence(submission_id);

CREATE TABLE IF NOT EXISTS cd_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES cd_submissions(id),
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,                   -- sha256 of normalized URL, used to detect shared origin
  domain TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cd_src_hash ON cd_sources(url_hash);

-- Provenance / relationship between submissions.
-- possible_duplicate, shared_source and nearby are automatic WARNINGS only: they never count as corroboration.
-- independent_confirmation and confirmed_duplicate are set only by an authenticated reviewer.
CREATE TABLE IF NOT EXISTS cd_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES cd_submissions(id),
  related_id INTEGER NOT NULL REFERENCES cd_submissions(id),
  kind TEXT NOT NULL CHECK (kind IN ('possible_duplicate','shared_source','nearby','confirmed_duplicate','independent_confirmation','same_origin')),
  score REAL,
  created_by TEXT NOT NULL,                 -- 'system' or reviewer email
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cd_rel_sub ON cd_relations(submission_id);

CREATE TABLE IF NOT EXISTS cd_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES cd_submissions(id),
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  internal_note TEXT,                       -- PRIVATE reviewer note
  reviewer TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cd_dec_sub ON cd_decisions(submission_id);

CREATE TABLE IF NOT EXISTS cd_published (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL UNIQUE REFERENCES cd_submissions(id),
  ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  short_explanation TEXT NOT NULL,
  finding_instructions TEXT NOT NULL,
  region TEXT NOT NULL,
  evidence_status TEXT NOT NULL,
  credit_name TEXT,                         -- only set when contributor chose named credit
  public_links TEXT,                        -- JSON array of reviewer-approved {label,url} (rendered nofollow ugc)
  related_guides TEXT,                      -- JSON array of reviewer-chosen same-site paths
  is_published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  updated_at TEXT NOT NULL,
  map_approved INTEGER NOT NULL DEFAULT 0,
  map_pin TEXT                              -- JSON pin proposal in the existing map-pins.json schema
);
CREATE INDEX IF NOT EXISTS idx_cd_pub_list ON cd_published(is_published, published_at);

CREATE TABLE IF NOT EXISTS cd_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  submission_id INTEGER,
  before_json TEXT,
  after_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_cd_audit_sub ON cd_audit(submission_id);

CREATE TABLE IF NOT EXISTS cd_rate_limit (
  key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (key, window_start)
);

-- Audit history is append-only.
CREATE TRIGGER IF NOT EXISTS trg_cd_audit_no_update BEFORE UPDATE ON cd_audit BEGIN SELECT RAISE(ABORT, 'cd_audit is append-only'); END;
CREATE TRIGGER IF NOT EXISTS trg_cd_audit_no_delete BEFORE DELETE ON cd_audit BEGIN SELECT RAISE(ABORT, 'cd_audit is append-only'); END;
CREATE TRIGGER IF NOT EXISTS trg_cd_dec_no_update BEFORE UPDATE ON cd_decisions BEGIN SELECT RAISE(ABORT, 'cd_decisions is append-only'); END;
CREATE TRIGGER IF NOT EXISTS trg_cd_dec_no_delete BEFORE DELETE ON cd_decisions BEGIN SELECT RAISE(ABORT, 'cd_decisions is append-only'); END;
