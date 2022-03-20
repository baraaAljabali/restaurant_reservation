const express = require('express');
const _ = require('underscore');
const checkAuth = require ('../middleware/check-auth');
const userValidators = require("../middleware/validators/user-validators");
const userController = require('../controllers/user');

const router = express.Router();

router.post(
    '/login',
    userController.login
);

router.post(
    '/add-user',
    _.partial(checkAuth, ['admin']),
    userValidators.employeeNumberValidator,
    userValidators.employeeNameValidator,
    userValidators.employeeRoleValidator,
    userValidators.employeePasswordValidator,
    userController.addUser
);

module.exports = router;
