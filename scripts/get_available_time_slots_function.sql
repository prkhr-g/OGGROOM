CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_shop_id UUID,
    p_barber_id BIGINT,
    p_date DATE,
    p_service_duration INTEGER
)
RETURNS TABLE (time_slot TIME)
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
    current_time TIME;
    minutes_from_opening INTEGER;
    slot_hour INTEGER;
    slot_minute INTEGER;
    can_fit_service BOOLEAN;
    i INTEGER;
    j INTEGER;
BEGIN
    -- Fetch shop opening/closing times
    SELECT opening_time, closing_time
    INTO v_opening_time, v_closing_time
    FROM public.shops
    WHERE id = p_shop_id;

    IF v_opening_time IS NULL THEN
        RAISE EXCEPTION 'Shop not found or opening/closing times not set.';
    END IF;

    -- Initialize timeline
    open_hour := EXTRACT(HOUR FROM v_opening_time);
    open_minute := EXTRACT(MINUTE FROM v_opening_time);
    close_hour := EXTRACT(HOUR FROM v_closing_time);
    close_minute := EXTRACT(MINUTE FROM v_closing_time);

    total_minutes := (close_hour - open_hour) * 60 + (close_minute - open_minute);
    number_of_slots := total_minutes / 15;

    FOR i IN 0..number_of_slots-1 LOOP
        timeline[i] := TRUE;
    END LOOP;

    -- Mark booked slots on the timeline
    FOR r IN SELECT booking_time, service_ids FROM public.bookings
             WHERE shop_id = p_shop_id
               AND barber_id = p_barber_id
               AND booking_date = p_date
               AND status = 'confirmed'
    LOOP
        DECLARE
            booked_service_duration INTEGER := 0;
            booking_start_minute INTEGER;
            start_index INTEGER;
            slots_to_book INTEGER;
            service_id BIGINT;
        BEGIN
            -- Calculate total duration for the booked services
            IF r.service_ids IS NOT NULL THEN
                FOREACH service_id IN ARRAY r.service_ids
                LOOP
                    SELECT duration INTO booked_service_duration
                    FROM public.services
                    WHERE id = service_id;
                    booked_service_duration := booked_service_duration + COALESCE(booked_service_duration, 30); -- Default to 30 if not found
                END LOOP;
            ELSE
                booked_service_duration := 30; -- Default if no services
            END IF;

            booking_start_minute := (EXTRACT(HOUR FROM r.booking_time) - open_hour) * 60 + (EXTRACT(MINUTE FROM r.booking_time) - open_minute);
            start_index := booking_start_minute / 15;
            slots_to_book := booked_service_duration / 15;

            FOR i IN 0..slots_to_book-1 LOOP
                IF start_index + i < number_of_slots THEN
                    timeline[start_index + i] := FALSE;
                END IF;
            END LOOP;
        END;
    END LOOP;

    -- Generate available time slots from the timeline
    FOR i IN 0..number_of_slots-1 LOOP
        IF timeline[i] THEN
            can_fit_service := TRUE;
            FOR j IN 0..(p_service_duration / 15)-1 LOOP
                IF (i + j >= number_of_slots) OR (NOT timeline[i + j]) THEN
                    can_fit_service := FALSE;
                    EXIT;
                END IF;
            END LOOP;

            IF can_fit_service THEN
                minutes_from_opening := i * 15;
                slot_hour := open_hour + FLOOR(minutes_from_opening / 60);
                slot_minute := open_minute + (minutes_from_opening % 60);
                time_slot := MAKE_TIME(slot_hour, slot_minute, 0);
                RETURN NEXT;
            END IF;
        END IF;
    END LOOP;

    RETURN;
END;
$$;