-- Run this ONCE ONLY if PRAGMA table_info(cars) does NOT already show details_json.
-- It will report a duplicate-column error if details_json is already present.
ALTER TABLE cars ADD COLUMN details_json TEXT DEFAULT '{}';
