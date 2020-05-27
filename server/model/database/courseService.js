const db = require('./db');

exports.getCourseByCodeSectionSession = async function(code, section, session) {
    try {
        const res = await db.query('SELECT * FROM course WHERE code = $1 AND ' + 
            'section = $2 AND session = $3', 
            [code, section, session]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getCourseDetailByCodeSectionSession = async function(code, section, session) {
    try {
        const res = await db.query('SELECT *, ' + 
            't.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' +
            'SELECT c.id, c.course_description, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' +
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE c.session = $3 AND c.section = $2 AND c.code = $1 ' +
            'GROUP BY c.id) t', 
            [code, section, session]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.addCourse = async function(orgName, code, section, courseDescription, session) {
    try {
        const res = await db.query('INSERT INTO course (org_name, code, section, ' + 
            'course_description, session) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [orgName, code, section, courseDescription, session]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getLectureByCourseIdMethodSection = async function(courseId, method, section) {
    try {
        const res = await db.query('SELECT * FROM lecture WHERE course_id = $1 AND ' + 
            'teaching_method = $2 AND section_number = $3', 
            [courseId, method, section]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getLecturesAndInstructorByCourseId = async function(courseId) {
    try {
        const res = await db.query('SELECT l.*, i.id as instructor_id, i.first_name, ' +  
            'i.last_name FROM lecture l ' +  
            'LEFT JOIN lecture_instructor li ON l.id = li.lecture_id ' +  
            'LEFT JOIN instructor i ON i.id = li.instructor_id ' +  
            'WHERE l.course_id = $1', 
            [courseId]);
        
        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

// IMPORTANT: percent_remaining is the inverse of drop rate
exports.getCoursesWithDropRateDesc = async function(code, orgName, session, section, minEnrol, page) {
    try {
        const itemPerPage = 10;
        const pageOffset = itemPerPage * (page-1);
        const res = await db.query('SELECT * FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' + 
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' + 
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE (c.code = $1 OR $1::text IS NULL) AND ' +
            '(c.org_name = $2 OR $2::text IS NULL) AND ' +
            '(c.session = $3 OR $3::text IS NULL) AND ' + 
            '(c.section = $4 OR $4::text IS NULL) ' +
            'GROUP BY c.id ORDER by c.id) t ' + 
            'WHERE t.initial_enrolment > $5) t2 ' + 
            'ORDER BY t2.percent_remaining ASC LIMIT $6 OFFSET $7', 
            [code, orgName, session, section, minEnrol, itemPerPage, pageOffset]);
        
        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}
// IMPORTANT: percent_remaining is the inverse of drop rate
exports.getCoursesWithDropRateAsc = async function(code, orgName, session, section, minEnrol, page) {
    try {
        const itemPerPage = 10;
        const pageOffset = itemPerPage * (page-1);
        const res = await db.query('SELECT * FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' + 
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' + 
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE (c.code = $1 OR $1::text IS NULL) AND ' +
            '(c.org_name = $2 OR $2::text IS NULL) AND ' +
            '(c.session = $3 OR $3::text IS NULL) AND ' + 
            '(c.section = $4 OR $4::text IS NULL) ' +
            'GROUP BY c.id ORDER by c.id) t ' + 
            'WHERE t.initial_enrolment > $5) t2 ' + 
            'ORDER BY t2.percent_remaining DESC LIMIT $6 OFFSET $7', 
            [code, orgName, session, section, minEnrol, itemPerPage, pageOffset]);
        
        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}
exports.getCountCoursesWithDropRateCount = async function(code, orgName, session, section, minEnrol) {
    try {
        const res = await db.query('SELECT COUNT(*) FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' + 
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' + 
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE (c.code = $1 OR $1::text IS NULL) AND ' +
            '(c.org_name = $2 OR $2::text IS NULL) AND ' +
            '(c.session = $3 OR $3::text IS NULL) AND ' + 
            '(c.section = $4 OR $4::text IS NULL) ' +
            'GROUP BY c.id ORDER by c.id) t ' + 
            'WHERE t.initial_enrolment > $5) t2 ',
            [code, orgName, session, section, minEnrol]);
        
        return res.rows[0]["count"];;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getMostDroppedBySessionSectionPage = async function(session, section, page) {
    try {
        const itemPerPage = 10;
        const pageOffset = itemPerPage * (page-1);
        const res = await db.query('SELECT * FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' +
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' +
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE c.session = $1 AND c.section = $2 ' +
            'GROUP BY c.id ORDER by c.id) t ' +
            'WHERE t.initial_enrolment > 30 AND t.initial_enrolment != 0) t2 ' +
            'ORDER BY t2.percent_remaining ASC LIMIT $3 OFFSET $4', 
            [session, section, itemPerPage, pageOffset]);
        
        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}
exports.getMostDroppedNumRecords = async function(session, section) {
    try {
        const res = await db.query('SELECT COUNT(*) FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' +
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' +
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE c.session = $1 AND c.section = $2 ' +
            'GROUP BY c.id ORDER by c.id) t ' +
            'WHERE t.initial_enrolment > 30 AND t.initial_enrolment != 0) t2',
            [session, section]);
        
        return res.rows[0]["count"];
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

// difference from most: DESC order
exports.getLeastDroppedBySessionSectionPage = async function(session, section, page) {
    try {
        const itemPerPage = 10;
        const pageOffset = itemPerPage * (page-1);
        const res = await db.query('SELECT * FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' +
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' +
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE c.session = $1 AND c.section = $2 ' +
            'GROUP BY c.id ORDER by c.id) t ' +
            'WHERE t.initial_enrolment > 30 AND t.initial_enrolment != 0) t2 ' +
            // WHERE t2.percent_remaining < 1 
            'ORDER BY t2.percent_remaining DESC LIMIT $3 OFFSET $4', 
            [session, section, itemPerPage, pageOffset]);
        
        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}
exports.getLeastDroppedNumRecords = async function(session, section) {
    try {
        const res = await db.query('SELECT COUNT(*) FROM ( ' +
            'SELECT *, t.final_enrolment/t.initial_enrolment as percent_remaining FROM ( ' +
            'SELECT c.id, c.org_name, c.code, c.section, c.session, ' + 
            'SUM(l.first_actual_waitlist) as initial_waitlist, ' + 
            'SUM(l.first_actual_enrolment) as initial_enrolment, ' + 
            'SUM(l.last_actual_enrolment) as final_enrolment, ' + 
            'SUM(l.last_enrolment_capacity) as enrolment_capacity ' +
            'FROM course c JOIN lecture l ON c.id = l.course_id ' + 
            'WHERE c.session = $1 AND c.section = $2 ' +
            'GROUP BY c.id ORDER by c.id) t ' +
            'WHERE t.initial_enrolment > 30 AND t.initial_enrolment != 0) t2', 
            [session, section]);
        
        return res.rows[0]["count"];
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getEnrolmentHistorysByCourseId = async function(courseId) {
    try {
        const res = await db.query('SELECT *, create_date::timestamp::date as date ' +
            'FROM lecture_enrolment_history WHERE ' + 
            'lecture_id IN (SELECT l.id FROM course c ' + 
            'LEFT JOIN lecture l ON c.id = l.course_id WHERE c.id = $1) ' + 
            'ORDER BY create_date', 
            [courseId]);
    
        return res.rows;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.addLecture = async function(courseId, method, section, firstActualEnrolment, lastActualEnrolment) {
    try {
        const res = await db.query('INSERT INTO lecture (course_id, ' + 
            'teaching_method, section_number, first_actual_enrolment, ' +
            'last_actual_enrolment) VALUES ' + 
            '($1, $2, $3, $4, $5) RETURNING *', 
            [courseId, method, section, firstActualEnrolment, lastActualEnrolment]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.updateLectureLastCapacityLastEnrolment = async function(lectureId, lastEnrolmentCapacity, lastActualEnrolment) {
    try {
        const res = await db.query('UPDATE lecture SET last_enrolment_capacity = $1, last_actual_enrolment = $2 WHERE id = $3', 
            [lastEnrolmentCapacity, lastActualEnrolment, lectureId]);
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.addLectureEnrolmentHistory = async function(lectureId, enrolmentCapacity, actualEnrolment, actualWaitlist) {
    try {
        const res = await db.query('INSERT INTO lecture_enrolment_history (lecture_id, ' + 
            'enrolment_capacity, actual_enrolment, actual_waitlist) VALUES ' + 
            '($1, $2, $3, $4) RETURNING *', 
            [lectureId, enrolmentCapacity, actualEnrolment, actualWaitlist]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getLectureEnrolmentHistory = async function(lectureId, enrolmentCapacity, actualEnrolment, actualWaitlist) {
    try {
        const res = await db.query('SELECT * FROM lecture_enrolment_history WHERE ' + 
            'lecture_id = $1 AND enrolment_capacity = $2 AND actual_enrolment = $3 AND ' + 
            'actual_waitlist = $4', 
            [lectureId, enrolmentCapacity, actualEnrolment, actualWaitlist]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.getInstructorByFirstNameLastName = async function(firstName, lastName) {
    try {
        const res = await db.query('SELECT * FROM instructor WHERE first_name = $1 AND ' + 
            'last_name = $2', 
            [firstName, lastName]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.addInstructor = async function(firstName, lastName) {
    try {
        const res = await db.query('INSERT INTO instructor (first_name, ' + 
            'last_name) VALUES ($1, $2) RETURNING id', 
            [firstName, lastName]);
        if (res.rows.length === 1) {
            return res.rows[0];
        }
        return null;
    } catch (err) {
        console.log(err.stack);
        return null;
    }
}

exports.addLectureInstructor = async function(lectureId, instructorId) {
    try {
        const res = await db.query('INSERT INTO lecture_instructor (lecture_id, ' + 
            'instructor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', 
            [lectureId, instructorId]);
        return true;
    } catch (err) {
        console.log(err.stack);
        return false;
    }
}
// id BIGSERIAL PRIMARY KEY,
// org_name VARCHAR(10) NOT NULL references organization(name),
// code VARCHAR(10) NOT NULL,
// section section_type NOT NULL,
// course_description VARCHAR NULL,
// session VARCHAR(10) NOT NULL,



