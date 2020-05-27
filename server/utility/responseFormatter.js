exports.success = function success(response) {
    response["status"] = "success";

    return response;
}

error = function error(response) {
    response["status"] = "error";

    return response;
}
exports.error = error;

exports.errorIncorrectSecret = function errorIncorrectSecret(response) {
    response = error(response);
    response["errorCode"] = "INCORRECT_SECRET";

    return response;
}

exports.errorIncorrectParam = function errorIncorrectParam(response, description) {
    response = error(response);
    response["errorCode"] = "INCORRECT_PARAM";
    response["errorDesc"] = description;

    return response;
}

exports.errorRouteNotFound = function errorRouteNotFound(response) {
    response = error(response);
    response["errorCode"] = "ROUTE_NOT_FOUND";

    return response;
}

exports.errorRecordNotFound = function errorRecordNotFound(response) {
    response = error(response);
    response["errorCode"] = "RECORD_NOT_FOUND";

    return response;
}

exports.errorRecordNotKnown = function errorRecordNotKnown(response) {
    response = error(response);
    response["errorCode"] = "RECORD_NOT_KNOWN";
    response["errorDesc"] = "This project was started on Jan 2020. We currently only have records for [20199S]. 20205FS coming soon.";

    return response;
}