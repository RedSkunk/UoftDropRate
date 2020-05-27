DROP TABLE IF EXISTS lecture_instructor CASCADE;
DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS lecture_enrolment_history CASCADE;
DROP TABLE IF EXISTS lecture CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TYPE IF EXISTS section_type CASCADE;
DROP TABLE IF EXISTS organization CASCADE;

CREATE TABLE organization (
    name VARCHAR(10) PRIMARY KEY,
    description VARCHAR NULL
);

CREATE TYPE section_type AS ENUM ('F', 'S', 'Y');

CREATE TABLE course (
    id BIGSERIAL PRIMARY KEY,
    org_name VARCHAR(10) NOT NULL references organization(name),
    code VARCHAR(10) NOT NULL,
    section section_type NOT NULL,
    course_description VARCHAR NULL,
    session VARCHAR(10) NOT NULL,
    CONSTRAINT unique_code_section_session UNIQUE(code, section, session)
);

CREATE TABLE lecture (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL references course(id),
    teaching_method VARCHAR(10) NOT NULL,
    section_number VARCHAR(10) NOT NULL,
    first_actual_waitlist BIGINT NULL,
    first_actual_enrolment BIGINT NULL,
    last_actual_enrolment BIGINT NULL,
    last_enrolment_capacity BIGINT NULL,
    CONSTRAINT unique_course_id_method_section UNIQUE(course_id, teaching_method, section_number)
);

-- SELECT * FROM ( 
-- SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( 
-- SELECT c.id, c.org_name, c.code, c.section, c.session, 
-- SUM(l.first_actual_waitlist) as initial_waitlist, 
-- SUM(l.first_actual_enrolment) as initial_enrolment, 
-- SUM(l.last_actual_enrolment) as final_enrolment, 
-- SUM(l.last_enrolment_capacity) as enrolment_capacity
-- FROM course c JOIN lecture l ON c.id = l.course_id 
-- WHERE c.session = '20199' AND c.section = 'S' AND c.code = 'GGR203H1'
-- GROUP BY c.id ORDER by c.id) t
-- WHERE t.initial_enrolment > 30 AND t.initial_enrolment != 0) t2
-- ORDER BY t2.percent_remaining DESC

-- SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( 
-- SELECT c.id, c.org_name, c.code, c.section, c.session, 
-- SUM(l.first_actual_waitlist) as initial_waitlist, 
-- SUM(l.first_actual_enrolment) as initial_enrolment, 
-- SUM(l.last_actual_enrolment) as final_enrolment, 
-- SUM(l.last_enrolment_capacity) as enrolment_capacity
-- FROM course c JOIN lecture l ON c.id = l.course_id 
-- WHERE c.session = '20199' AND c.section = 'S' AND c.code = 'GGR203H1'
-- GROUP BY c.id)

-- SELECT * FROM (
-- SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( 
-- SELECT c.id, c.org_name, c.code, c.section, c.session, 
-- SUM(l.first_actual_waitlist) as initial_waitlist, 
-- SUM(l.first_actual_enrolment) as initial_enrolment, 
-- SUM(l.last_actual_enrolment) as final_enrolment, 
-- SUM(l.last_enrolment_capacity) as enrolment_capacity 
-- FROM course c JOIN lecture l ON c.id = l.course_id 
-- WHERE (c.code = $1 OR NULL) AND
-- (c.org_name = $2 OR NULL) AND
-- (c.session = $3 OR NULL) AND 
-- (c.section = $4 OR NULL) AND
-- GROUP BY c.id ORDER by c.id) t 
-- WHERE t.initial_enrolment != 0) t2 
-- ORDER BY t2.percent_remaining ASC LIMIT $5 OFFSET $6

SELECT * FROM (
SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( 
SELECT c.id, c.org_name, c.code, c.section, c.session, 
SUM(l.first_actual_waitlist) as initial_waitlist, 
SUM(l.first_actual_enrolment) as initial_enrolment, 
SUM(l.last_actual_enrolment) as final_enrolment, 
SUM(l.last_enrolment_capacity) as enrolment_capacity 
FROM course c JOIN lecture l ON c.id = l.course_id 
WHERE (c.code = NULL OR NULL::text IS NULL) AND
(c.org_name = 'CSC' OR 'CSC'::text IS NULL) AND
(c.session = '20199' OR '20199'::text IS NULL) AND 
(c.section = 'S' OR 'S'::text IS NULL)
GROUP BY c.id ORDER by c.id) t 
WHERE t.initial_enrolment > 0) t2 
ORDER BY t2.percent_remaining ASC LIMIT 10 OFFSET 0

SELECT COUNT(*) FROM (
SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( 
SELECT c.id, c.org_name, c.code, c.section, c.session, 
SUM(l.first_actual_waitlist) as initial_waitlist, 
SUM(l.first_actual_enrolment) as initial_enrolment, 
SUM(l.last_actual_enrolment) as final_enrolment, 
SUM(l.last_enrolment_capacity) as enrolment_capacity 
FROM course c JOIN lecture l ON c.id = l.course_id 
WHERE (c.code = NULL OR NULL::text IS NULL) AND
(c.org_name = 'CSC' OR 'CSC'::text IS NULL) AND
(c.session = '20199' OR '20199'::text IS NULL) AND 
(c.section = 'S' OR 'S'::text IS NULL)
GROUP BY c.id ORDER by c.id) t 
WHERE t.initial_enrolment > 0) t2 


-- 'SELECT * FROM ( ' +
--             'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' +
--             'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
--             'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
--             'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
--             'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
--             'SUM(l.last_enrolment_capacity) as enrolment_capacity ' +
--             'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
--             'WHERE c.session = $1 AND c.section = $2 ' +
--             'GROUP BY c.id ORDER by c.id) t ' +
--             'WHERE t.initial_enrolment > 30 AND t.initial_enrolment != 0) t2 ' +
--             'WHERE t2.percent_remaining < 1 ORDER BY t2.percent_remaining

CREATE TABLE lecture_enrolment_history (
    lecture_id BIGINT NOT NULL references lecture(id),
    enrolment_capacity BIGINT NOT NULL,
    actual_enrolment BIGINT NOT NULL,
    actual_waitlist BIGINT NOT NULL,
    create_date TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE instructor (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);

CREATE TABLE lecture_instructor (
    lecture_id BIGINT NOT NULL references lecture(id),
    instructor_id BIGINT NOT NULL references instructor(id),
    CONSTRAINT unique_lecture_id_instructor_id UNIQUE(lecture_id, instructor_id)
);



-- DROP TABLE IF EXISTS custom_map_score CASCADE;
-- DROP TABLE IF EXISTS custom_map CASCADE;
-- DROP TABLE IF EXISTS appuser CASCADE;

-- CREATE TABLE appuser (
-- 	id BIGSERIAL PRIMARY KEY,
-- 	username VARCHAR(50) NOT NULL UNIQUE,
-- 	password_hash VARCHAR(255) NOT NULL,
-- 	create_date TIMESTAMP NOT NULL DEFAULT current_timestamp,
-- 	auth_token VARCHAR NULL,
-- 	auth_token_expire_date TIMESTAMP NULL
-- );

-- CREATE TABLE custom_map(
-- 	id BIGSERIAL PRIMARY KEY,
-- 	map_name VARCHAR(50) NOT NULL UNIQUE,
-- 	map_description VARCHAR(1000),
-- 	map_data VARCHAR NOT NULL,
-- 	created_by BIGINT NOT NULL references appuser(id),
-- 	create_date TIMESTAMP NOT NULL DEFAULT current_timestamp,
-- 	last_update_date TIMESTAMP NOT NULL DEFAULT current_timestamp,
-- 	play_count BIGINT NOT NULL DEFAULT 0,
-- 	win_count BIGINT NOT NULL DEFAULT 0,
-- 	average_score NUMERIC(10,2) NOT NULL DEFAULT 0,
-- 	average_rating_5 NUMERIC(3,2) NOT NULL DEFAULT 0
-- );

-- CREATE TABLE custom_map_score(
-- 	id BIGSERIAL PRIMARY KEY,
-- 	map_id BIGINT NOT NULL references custom_map(id),
-- 	user_id BIGINT NOT NULL references appuser(id),
-- 	score NUMERIC(10,2) NOT NULL,
-- 	rating_5 NUMERIC(3,2) NULL,
-- 	won BOOLEAN NOT NULL
-- );

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ts_be;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ts_be;