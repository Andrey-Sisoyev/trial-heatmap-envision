DROP FUNCTION IF EXISTS getBookHeatMap(integer, integer);
DROP FUNCTION IF EXISTS _getCovPosIntervals(integer, integer);
DROP TYPE IF EXISTS PosInterval;
DROP TYPE IF EXISTS PosIntervalHeat;

DROP TABLE IF EXISTS coverage CASCADE;
drop SEQUENCE IF EXISTS seq_coverage_id;

DROP TABLE IF EXISTS books CASCADE;
drop SEQUENCE IF EXISTS seq_book_id;

----------------------------------------------------------
----------------------------------------------------------

CREATE SEQUENCE seq_book_id;
CREATE SEQUENCE seq_coverage_id;
CREATE SEQUENCE seq_coverage_cache_id;

CREATE TABLE books(
    id          integer PRIMARY KEY DEFAULT nextval('seq_book_id')
  , words_count bigint  NOT NULL
  );

CREATE TABLE coverage(
    id        bigint PRIMARY KEY DEFAULT nextval('seq_coverage_id')
  , book_id   integer NOT NULL
  , user_id   integer NOT NULL
  , start_pos bigint  NOT NULL
  , end_pos   bigint  NOT NULL
  );

CREATE INDEX coverage_idx1 ON coverage(book_id);
CREATE INDEX coverage_idx2 ON coverage(book_id, user_id);

CREATE TYPE PosInterval as (start_pos bigint, end_pos bigint);
CREATE TYPE PosIntervalHeat as (start_pos bigint, end_pos bigint, heat integer);

-- (book_id, user_id)
CREATE OR REPLACE FUNCTION getBookHeatMap(integer, integer) RETURNS SETOF PosIntervalHeat AS $$
    WITH target_coverage as (
            SELECT start_pos, end_pos
            FROM coverage
            WHERE $1 = book_id AND ($2 IS NULL OR $2 = user_id)
         )
       , all_positions as (
            WITH all_positions_dup as (
                SELECT DISTINCT start_pos as pos
                FROM target_coverage
                union 
                SELECT DISTINCT end_pos as pos
                FROM target_coverage
            ) SELECT DISTINCT(pos) pos, row_number() OVER(ORDER BY pos ASC) as rownum
            FROM all_positions_dup
            ORDER BY pos ASC
            )
       , all_coverages as (
            select p1.pos as start_pos, p2.pos as end_pos
            from all_positions as p1
               , all_positions as p2
            where p1.rownum = p2.rownum - 1   
         )
    SELECT pi.start_pos, pi.end_pos, cast(count(pi.*) as integer)
    FROM target_coverage as c
       , all_coverages as pi
    WHERE c.start_pos <= pi.start_pos 
      AND c.end_pos   >= pi.end_pos
    GROUP BY pi.start_pos, pi.end_pos  
    ORDER BY pi.start_pos
    ;
$$ LANGUAGE SQL;