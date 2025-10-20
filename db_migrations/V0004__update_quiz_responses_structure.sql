-- Update quiz_responses to support flexible structure
ALTER TABLE t_p90617481_stylist_quiz_creatio.quiz_responses 
ADD COLUMN IF NOT EXISTS template_id INTEGER,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS answers JSONB;

-- Migrate existing data
UPDATE t_p90617481_stylist_quiz_creatio.quiz_responses 
SET 
    contact_name = name,
    contact_phone = phone,
    contact_email = email,
    answers = jsonb_build_object(
        'age_range', age_range,
        'body_type', body_type,
        'style_preferences', style_preferences,
        'color_preferences', color_preferences,
        'wardrobe_goals', wardrobe_goals,
        'budget_range', budget_range,
        'lifestyle', lifestyle
    )
WHERE contact_name IS NULL;