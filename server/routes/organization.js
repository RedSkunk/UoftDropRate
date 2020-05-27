let PromiseRouter = require('express-promise-router');
let router = new PromiseRouter();
let organizationService = require('../model/database').organizationService;
let responseFormatter = require('../utility/responseFormatter');
let constants = require('../utility/constants');

router.get('/', async function(req, res, next) {
    let response = {};
    let organizations = await organizationService.getOrganizations();
    if (organizations === null) {
        res.status(200).send(responseFormatter.errorRecordNotFound(response));
        return;
    }

    response["organizations"] = organizations;
    res.status(200).send(responseFormatter.success(response)); 
});

router.post('/', async function(req, res, next) {
    let inputJson = req.body;
    let secretIdInput = inputJson['secretId'];
    
    let response = {};
    if (secretIdInput == null || secretIdInput !== constants.secretId) {
        res.status(200).send(responseFormatter.errorIncorrectSecret(response));
        return;
    }

    let orgData = inputJson['data'];
    for (const org of orgData) {
        organizationService.addOrganization(org['name'], org['description']);
    }
    
    res.status(200).send(responseFormatter.success(response));
});

module.exports = router;
