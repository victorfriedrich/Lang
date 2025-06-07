-- Fix mismatched return type in get_userwords_filtered
CREATE OR REPLACE FUNCTION public.get_userwords_filtered (
    language_filter text,
    due_type        text,
    page_size       integer,
    p_source        text DEFAULT NULL
)
RETURNS TABLE (
    word_id           bigint,
    word_root         text,
    translation       text,
    next_review_due_at timestamptz
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        uw.word_id::bigint,
        w.root AS word_root,
        COALESCE(ut.custom_translation, w.translation) AS translation,
        uw.next_review_due_at
    FROM userwords            AS uw
    JOIN words                AS w  ON uw.word_id = w.id
    LEFT JOIN usertranslations ut
           ON ut.word_id = w.id
          AND ut.user_id = auth.uid()
    WHERE uw.user_id = auth.uid()
      AND w.language = language_filter
      AND (p_source IS NULL OR uw.source = p_source)
      AND (
            (due_type = 'today'   AND uw.next_review_due_at::date = CURRENT_DATE) OR
            (due_type = 'overdue' AND uw.next_review_due_at <  CURRENT_DATE)      OR
            (due_type = 'both'    AND (uw.next_review_due_at < CURRENT_DATE
                                    OR  uw.next_review_due_at::date = CURRENT_DATE))
          )
    ORDER BY uw.next_review_due_at
    FETCH NEXT page_size ROWS ONLY;
END;
$function$;
