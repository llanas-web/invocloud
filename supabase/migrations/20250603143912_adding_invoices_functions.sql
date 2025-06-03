set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_auth_user_allowed_establishment(_establishment_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$BEGIN
  RETURN EXISTS(
    SELECT 1
    FROM public.establishments
    WHERE establishments.creator_id = auth.uid()
  );
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_auth_user_establishment_creator(_establishment_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE 
  establishment_count int;

BEGIN
  RAISE LOG 'Is % the creator of %', auth.uid(), _establishment_id;
  
  SELECT COUNT(*) INTO establishment_count    
  FROM establishments
  WHERE challenges.id = _establishment_id AND challenges.creator_id = auth.uid();
  
  RAISE LOG 'There is % establishment', challenge_count;

  RETURN establishment_count > 0;
END;$function$
;


