-- Add actual_title column to generations table
ALTER TABLE public.generations 
ADD COLUMN actual_title TEXT;

-- Update the existing rows to use input_text as actual_title temporarily
UPDATE public.generations 
SET actual_title = input_text 
WHERE actual_title IS NULL;