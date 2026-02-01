-- Add gender to character_templates for opposite-gender auto-assignment
-- Values: 'male' | 'female' | null (null = any, for backward compatibility)

ALTER TABLE public.character_templates
ADD COLUMN IF NOT EXISTS gender text;

COMMENT ON COLUMN public.character_templates.gender IS 'Character gender: male, female, or null (any). Used to assign opposite-gender characters to users.';
