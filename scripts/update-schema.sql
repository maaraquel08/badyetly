-- Add new columns to monthly_dues table
ALTER TABLE monthly_dues ADD COLUMN IF NOT EXISTS recurrence_frequency INTEGER DEFAULT 1;
ALTER TABLE monthly_dues ADD COLUMN IF NOT EXISTS end_type VARCHAR(20) DEFAULT 'never';
ALTER TABLE monthly_dues ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE monthly_dues ADD COLUMN IF NOT EXISTS occurrences INTEGER;

-- Update existing records to have default values
UPDATE monthly_dues SET recurrence_frequency = 1 WHERE recurrence_frequency IS NULL;
UPDATE monthly_dues SET end_type = 'never' WHERE end_type IS NULL;

-- Make amount nullable to support cards with varying amounts
ALTER TABLE monthly_dues ALTER COLUMN amount DROP NOT NULL;

-- Add paid_amount to due_instances to store actual payment amount
ALTER TABLE due_instances ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10,2);

-- Add monthly_salary to users table for financial reporting
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10,2);
