-- Add welcome fields to quiz_templates
ALTER TABLE t_p90617481_stylist_quiz_creatio.quiz_templates 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS welcome_title TEXT,
ADD COLUMN IF NOT EXISTS welcome_subtitle TEXT;

-- Rename name to title if exists and title doesn't
UPDATE t_p90617481_stylist_quiz_creatio.quiz_templates 
SET title = name 
WHERE title IS NULL;