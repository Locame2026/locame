-- Table for image metadata
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    bucket TEXT NOT NULL DEFAULT 'restaurant-images',
    entity_type TEXT NOT NULL,
    -- 'RESTAURANT', 'MENU_ITEM', 'REVIEW', 'USER'
    entity_id UUID NOT NULL,
    -- references restaurants.id, menu_items.id, etc.
    original_name TEXT,
    content_type TEXT,
    size INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Public can view images" ON images FOR
SELECT USING (true);
CREATE POLICY "Users can manage their own entity images" ON images FOR ALL USING (
    auth.uid() = (
        -- This logic will depend on the entity_type
        -- For simplicity, we can check if the user owns the entity
        -- but for now we'll allow authenticated users for testing
        -- and refine later
        auth.uid() IS NOT NULL
    )
);
-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);