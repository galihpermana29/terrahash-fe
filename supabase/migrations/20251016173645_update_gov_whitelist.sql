-- remove added_by
ALTER TABLE gov_whitelist
DROP COLUMN added_by,
DROP COLUMN wallet_address;
