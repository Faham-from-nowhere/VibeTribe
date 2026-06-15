CREATE OR REPLACE FUNCTION public.get_recommendations(user_id_param UUID, limit_num INT DEFAULT 5)
RETURNS SETOF public.songs AS $$
DECLARE
  rec_count INT;
BEGIN
  -- First, try to get collaborative filtering recommendations (users who liked similar songs)
  RETURN QUERY
  SELECT s.*
  FROM songs s
  JOIN liked_songs ls2 ON s.id = ls2.song_id
  WHERE ls2.user_id IN (
    SELECT ls.user_id
    FROM liked_songs ls
    WHERE ls.song_id IN (
      SELECT song_id FROM liked_songs WHERE user_id = user_id_param
    )
    AND ls.user_id != user_id_param
  )
  AND s.id NOT IN (
    SELECT song_id FROM liked_songs WHERE user_id = user_id_param
  )
  GROUP BY s.id
  ORDER BY COUNT(ls2.user_id) DESC
  LIMIT limit_num;

  GET DIAGNOSTICS rec_count = ROW_COUNT;

  -- If no collaborative recommendations found (e.g. new user or no other users), fallback to random unliked songs
  IF rec_count = 0 THEN
    RETURN QUERY
    SELECT * FROM songs 
    WHERE id NOT IN (SELECT song_id FROM liked_songs WHERE user_id = user_id_param)
    ORDER BY RANDOM()
    LIMIT limit_num;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload the PostgREST schema cache so the API recognizes the new function
NOTIFY pgrst, 'reload schema';
