-- Migration: Add Geolocation to Restaurants
-- Description: Adds latitude, longitude, and geohash fields for proximity searches.
-- 1. Enable PostGIS (optional but recommended for Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;
-- 2. Add columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS geohash TEXT,
    ADD COLUMN IF NOT EXISTS address_full TEXT;
-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_geohash ON restaurants(geohash);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
)
WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL;