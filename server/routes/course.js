let PromiseRouter = require('express-promise-router');
let router = new PromiseRouter();

let courseService = require('../model/database').courseService;
let responseFormatter = require('../utility/responseFormatter');
let constants = require('../utility/constants');
let inputValidate = require('../utility/inputValidate');

router.get('/list/search', async function(req, res, next) {
    let response = {};
    let code = inputValidate.isWhitespaceOrNull(req.query.code) ? null:req.query.code;
    let orgName = inputValidate.isWhitespaceOrNull(req.query.department) ? null:req.query.department;
    let session = inputValidate.isWhitespaceOrNull(req.query.session)? null:req.query.session;
    let section = inputValidate.isWhitespaceOrNull(req.query.section) ? null:req.query.section;
    let page = inputValidate.isWhitespaceOrNull(req.query.page) ? "1":req.query.page;
    let order = inputValidate.isWhitespaceOrNull(req.query.order) ? "DESC":req.query.order;
    let minEnrol = inputValidate.isWhitespaceOrNull(req.query.minEnrol) ? "30":req.query.minEnrol;

    if ( constants.currentAcceptedSession.indexOf(session+section) === -1 ) {
        res.status(200).send(responseFormatter.errorRecordNotKnown(response));
        return;
    }

    if (order === null || (order !== "ASC" && order !== "DESC")) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "Order must ASC or DESC."));
        return;
    }

    if (!inputValidate.isPositiveInteger(minEnrol)) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "MinEnrol has to be a positive integer."));
        return;
    }

    if (!inputValidate.isPositiveInteger(page)) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "Page has to be a positive integer."));
        return;
    }
    page = parseInt(page);

    let numRecords = await courseService.getCountCoursesWithDropRateCount(code, orgName, 
        session, section, minEnrol);
    // if ( (page*10 - numRecords) >= 10) {
    //     res.status(200).send(responseFormatter.errorIncorrectParam(response, 
    //         "Non existant page. Page exceeds maximum amount of record."));
    //     return;
    // }

    let courses = null;
    if (order === "ASC") {
        courses = await courseService.getCoursesWithDropRateAsc(
            code, orgName, session, section, minEnrol, page);
    } else {
        courses = await courseService.getCoursesWithDropRateDesc(
            code, orgName, session, section, minEnrol, page);
    }
    if (courses === null) {
        res.status(200).send(responseFormatter.errorRecordNotFound(response));
        return;
    }

    response["courses"] = courses;
    response["numRecords"] = numRecords; // used for paging on frontend

    res.status(200).send(responseFormatter.success(response));
});

router.get('/list/most-dropped/:session/:section/:page', async function(req, res, next) {
    let response = {};
    let params = req.params;
    let session = params["session"];
    let section = params["section"];
    let page = params["page"];

    if ( constants.currentAcceptedSession.indexOf(session+section) === -1 ) {
        res.status(200).send(responseFormatter.errorRecordNotKnown(response));
        return;
    }

    if (!inputValidate.isPositiveInteger(page)) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "Page param has to be a positive integer."));
        return;
    }
    page = parseInt(page);

    let numRecords = await courseService.getMostDroppedNumRecords(session, section);
    if ( (page*10 - numRecords) >= 10) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "Non existant page. Page exceeds maximum amount of record."));
        return;
    }

    let mostDroppedCourses = await courseService.getMostDroppedBySessionSectionPage(
        session, section, page);
    if (mostDroppedCourses === null) {
        res.status(200).send(responseFormatter.errorRecordNotFound(response));
        return;
    }

    response["courses"] = mostDroppedCourses;
    response["numRecords"] = numRecords; // used for paging on frontend

    res.status(200).send(responseFormatter.success(response));
});

router.get('/list/least-dropped/:session/:section/:page', async function(req, res, next) {
    let response = {};
    let params = req.params;
    let session = params["session"];
    let section = params["section"];
    let page = params["page"];

    if ( constants.currentAcceptedSession.indexOf(session+section) === -1 ) {
        res.status(200).send(responseFormatter.errorRecordNotKnown(response));
        return;
    }

    if (!inputValidate.isPositiveInteger(page)) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "Page param has to be a positive integer."));
        return;
    }
    page = parseInt(page);

    let numRecords = await courseService.getLeastDroppedNumRecords(session, section);
    if ( (page*10 - numRecords) >= 10) {
        res.status(200).send(responseFormatter.errorIncorrectParam(response, 
            "Non existant page. Page exceeds maximum amount of record."));
        return;
    }

    let mostDroppedCourses = await courseService.getLeastDroppedBySessionSectionPage(
        session, section, page);
    if (mostDroppedCourses === null) {
        res.status(200).send(responseFormatter.errorRecordNotFound(response));
        return;
    }

    response["courses"] = mostDroppedCourses;
    response["numRecords"] = numRecords; // used for paging on frontend

    res.status(200).send(responseFormatter.success(response));
});

router.get('/:code/:section/:session', async function(req, res, next) {
    let response = {};
    let params = req.params;

    let existingCourse = await courseService.getCourseDetailByCodeSectionSession(
        params["code"], params["section"], params["session"]);
    if (existingCourse === null) {
        res.status(200).send(responseFormatter.errorRecordNotFound(response));
        return;
    }
    response["course"] = existingCourse;

    let courseId = existingCourse["id"];
    let lectures = await courseService.getLecturesAndInstructorByCourseId(courseId);
    response["lectures"] = lectures;
    
    let enrolmentHistorys = await courseService.getEnrolmentHistorysByCourseId(courseId);
    response["enrolmentHistorys"] = enrolmentHistorys;

    res.status(200).send(responseFormatter.success(response));
});

router.post('/batch_processing', async function(req, res, next) {
    let inputJson = req.body;
    let secretIdInput = inputJson['secretId'];
    
    let response = {};
    if (secretIdInput == null || secretIdInput !== constants.secretId) {
        res.status(200).send(responseFormatter.errorIncorrectSecret(response));
        return;
    }

    let enrolmentHistoryAdded = 0;
    let courseData = inputJson['data'];
    for (const course of courseData) {
        let existingCourse = await courseService.getCourseByCodeSectionSession(course['code'], 
            course['section'], course['session']);
        if (existingCourse === null) {
            existingCourse = await courseService.addCourse(course['orgName'], course['code'], 
                course['section'], course['courseDescription'], course['session']);    
        }

        let courseId = existingCourse['id']
        for (const lecture of course['lectures']) {
            let existingLecture = await courseService.getLectureByCourseIdMethodSection(courseId,
                lecture['teachingMethod'], lecture['sectionNumber']);
            if (existingLecture === null) {
                existingLecture = await courseService.addLecture(courseId, 
                    lecture['teachingMethod'], lecture['sectionNumber'], 
                    lecture['actualEnrolment'], lecture['actualEnrolment']);
            } else {
                await courseService.updateLectureLastCapacityLastEnrolment(existingLecture['id'], 
                    lecture['enrolmentCapacity'], lecture['actualEnrolment']);
                console.log("aaa");
            }

            let lectureId = existingLecture['id'];
            let existingEnrolmentRecord = await courseService.getLectureEnrolmentHistory(lectureId, 
                lecture['enrolmentCapacity'], lecture['actualEnrolment'], 
                lecture['actualWaitlist']);
            if (existingEnrolmentRecord === null) {
                courseService.addLectureEnrolmentHistory(lectureId, 
                    lecture['enrolmentCapacity'], lecture['actualEnrolment'], 
                    lecture['actualWaitlist']);
                enrolmentHistoryAdded++;
            }

            for (const instructor of lecture['instructors']) {
                let existingInstructor = await courseService.getInstructorByFirstNameLastName(instructor['firstName'],
                    instructor['lastName']);
                if (existingInstructor === null) {
                    existingInstructor = await courseService.addInstructor(instructor['firstName'],
                        instructor['lastName']);
                }
                courseService.addLectureInstructor(lectureId, existingInstructor['id']);
            }
        }
    }
    console.log('EnrolmentHistory Added: ' + enrolmentHistoryAdded);
    res.status(200).send(responseFormatter.success(response));
});

// courseService.testQuery();
// const { Client } = require('pg');
// const client = new Client();
// client.connect();
// client.query('SELECT NOW()', [], (err, res) => {
//   console.log(err ? err.stack : res.rows[0]); // Hello World!
//   client.end();
// });

module.exports = router;
