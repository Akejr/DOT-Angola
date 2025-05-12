-- Create the visa_virtual_exchange_rates table
CREATE TABLE IF NOT EXISTS visa_virtual_exchange_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    currency TEXT NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on the currency column
CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_virtual_exchange_rates_currency ON visa_virtual_exchange_rates(currency);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON visa_virtual_exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Insert initial exchange rates
INSERT INTO visa_virtual_exchange_rates (currency, rate)
VALUES 
    ('EUR', 1300.00),  -- Euro
    ('BRL', 260.00)    -- Real Brasileiro
ON CONFLICT (currency) 
DO UPDATE SET rate = EXCLUDED.rate; 