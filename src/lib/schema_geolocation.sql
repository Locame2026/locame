-- Add geolocation columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS full_address TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS postal_code TEXT;
-- Create index for faster proximity searches (basic approach)
-- In a real production app with many restaurants, use PostGIS and GIST indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_coords ON restaurants(latitude, longitude);