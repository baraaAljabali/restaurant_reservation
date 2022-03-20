const express = require('express');
const _ = require('underscore');
const checkAuth = require ('../middleware/check-auth');
const tableValidators = require("../middleware/validators/table-validators");
const tableController = require('../controllers/table');

const router = express.Router();

router.get(
    '/all-tables',
    _.partial(checkAuth, ['admin']),
    tableController.getAllTables
);

router.post(
    '/add-table',
    _.partial(checkAuth, ['admin']),
    tableValidators.tableNumbreValidator,
    tableValidators.tableSeatsValidator,
    tableController.addTable
);

router.delete(
    '/one-table/:num',
    _.partial(checkAuth, ['admin']),
    tableController.deleteTable
);


module.exports = router;
