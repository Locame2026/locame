-- Migration: Add Payments Table
-- Description: Stores transaction history for restaurant menu payments.
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    stripe_payment_intent_id TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending, succeeded, failed, refunded
    menu_items JSONB,
    -- Optional: details of what was bought
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for user payment history
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
-- Index for restaurant reports
CREATE INDEX IF NOT EXISTS idx_transactions_restaurant_id ON transactions(restaurant_id);
-- Add column to restaurants for Stripe Account ID (if supporting Connect in future)
-- ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;