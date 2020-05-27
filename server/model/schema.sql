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