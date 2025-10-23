-- Option 1: Select existing shop IDs and names to use for your review
SELECT id, name FROM shops;

-- Option 2: Insert a new shop with the ID from your error message
-- IMPORTANT: Replace 'Your Shop Name', 'Your Shop Type', 'your@email.com', and '123-456-7890' with actual values.
-- Ensure the 'id' matches the one you're trying to use for the review.
INSERT INTO shops (id, name, type, email, phone, address, is_open, opening_time, closing_time)
VALUES (
    '68c56fbf-1a05-4a3b-a566-c54e41b692ff', -- The shop_id from your error message
    'New Example Shop',
    'Barber', -- e.g., 'Barber', 'Salon', 'Spa'
    'new.shop@example.com',
    '123-456-7890',
    '123 Main St, Anytown, USA',
    TRUE,
    '09:00:00',
    '18:00:00'
);