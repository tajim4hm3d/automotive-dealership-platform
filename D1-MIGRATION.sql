-- Safe to run more than once in Cloudflare D1 Console.
-- Both tables already exist; do not recreate them.
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_car_photos_car_id ON car_photos(car_id);
