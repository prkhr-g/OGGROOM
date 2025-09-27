CREATE OR REPLACE FUNCTION get_all_time_slots(
    p_shop_id UUID,
    p_barber_id BIGINT,
    p_date DATE
)
RETURNS TABLE (time_slot TIME, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_opening_time TIME;
    v_closing_time TIME;
    r RECORD;
    timeline BOOLEAN[];
    total_minutes INTEGER;
    number_of_slots INTEGER;
    open_hour INTEGER;
    open_minute INTEGER;
    close_hour INTEGER;
    close_minute INTEGER;
    calculated_time TIME;
    minutes_from_opening INTEGER;
    slot_hour INTEGER;
    slot_minute INTEGER;
    i INTEGER;
BEGIN
    -- Fetch shop opening/closing times
    SELECT opening_time, closing_time
    INTO v_opening_time, v_closing_time
    FROM public.shops
    WHERE id = p_shop_id;

    IF v_opening_time IS NULL OR v_closing_time IS NULL THEN
        RAISE EXCEPTION 'Shop not found or opening/closing times not set for shop %', p_shop_id;
    END IF;

    -- Initialize timeline for 15-minute intervals
    open_hour := EXTRACT(HOUR FROM v_opening_time);
    open_minute := EXTRACT(MINUTE FROM v_opening_time);
    close_hour := EXTRACT(HOUR FROM v_closing_time);
    close_minute := EXTRACT(MINUTE FROM v_closing_time);

    total_minutes := (close_hour - open_hour) * 60 + (close_minute - open_minute);
    number_of_slots := total_minutes / 15;

    -- Initialize all slots as available (TRUE)
    FOR i IN 0..number_of_slots-1 LOOP
        timeline[i] := TRUE;
    END LOOP;

    -- Mark booked slots on the timeline as unavailable (FALSE)
    FOR r IN 
        SELECT b.booking_time, b.service_ids
        FROM public.bookings b
        WHERE b.shop_id = p_shop_id
          AND b.barber_id = p_barber_id
          AND b.booking_date = p_date
          AND b.status = 'confirmed'
    LOOP
        DECLARE
            booking_start_minute INTEGER;
            start_index INTEGER;
            slots_to_book INTEGER;
            total_duration INTEGER := 0;
        BEGIN
            -- Calculate total duration for the booked services
            SELECT SUM(s.duration)
            INTO total_duration
            FROM public.services s
            WHERE s.id = ANY(r.service_ids);

            total_duration := COALESCE(total_duration, 30); -- Default to 30 if somehow null

            booking_start_minute := (EXTRACT(HOUR FROM r.booking_time) - open_hour) * 60 + (EXTRACT(MINUTE FROM r.booking_time) - open_minute);
            start_index := booking_start_minute / 15;
            slots_to_book := CEIL(total_duration / 15.0);

            FOR i IN 0..slots_to_book-1 LOOP
                IF start_index + i < number_of_slots THEN
                    timeline[start_index + i] := FALSE;
                END IF;
            END LOOP;
        END;
    END LOOP;

    -- Generate all time slots with their status
    FOR i IN 0..number_of_slots-1 LOOP
        minutes_from_opening := i * 15;
        slot_hour := open_hour + FLOOR(minutes_from_opening / 60);
        slot_minute := open_minute + (minutes_from_opening % 60);
        
        -- Ensure the calculated time does not exceed closing time
        calculated_time := MAKE_TIME(slot_hour, slot_minute, 0);

        IF calculated_time < v_closing_time THEN
            time_slot := calculated_time;
            status := CASE WHEN timeline[i] THEN 'available' ELSE 'booked' END;
            RETURN NEXT;
        END IF;
    END LOOP;

    RETURN;
END;
$$;
