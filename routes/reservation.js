const express = require('express');
const _ = require('underscore');
const checkAuth = require ('../middleware/check-auth');
const reservationsValidators = 
    require("../middleware/validators/reservation-validators");
const reservationsController = require('../controllers/reservation');

const router = express.Router();

router.get(
    '/all-reservations-today/:timeOrder/:page',
    _.partial(checkAuth, ['admin', 'employee']),
    reservationsValidators.pageValidator,
    reservationsController.getReservations
);

router.get(
    '/all-reservations/:page',
    _.partial(checkAuth, ['admin']),
    reservationsValidators.pageValidator,
    reservationsController.getReservations
);

/** tables is a string with table numbers sepersted bt comma. e.g. 1,2,3 */
router.get(
    '/all-reservations-by-tables/:tables/:page',
    _.partial(checkAuth, ['admin']),
    reservationsValidators.pageValidator,
    reservationsValidators.tablesFilterValidator,
    reservationsController.getReservations
);

/** dates are query values: from, to */
router.get(
    '/all-reservations-by-date/:page',
    _.partial(checkAuth, ['admin']),
    reservationsValidators.pageValidator,
    reservationsValidators.dateFilterValidator,
    reservationsController.getReservations
);

router.delete(
    '/cancel-reservation/:serial',
    _.partial(checkAuth, ['admin', 'employee']),
    reservationsController.cancelReservation
);

router.get(
    '/time-slots/:seats',
    _.partial(checkAuth, ['admin', 'employee']),
    reservationsValidators.seatsValidator,
    reservationsController.timeSlots
);

router.post(
    '/new-reservation',
    _.partial(checkAuth, ['admin', 'employee']),
    reservationsValidators.customerNameValidator,
    reservationsValidators.mobileValidator,
    reservationsValidators.timeValidator,
    reservationsValidators.tableValidator,
    reservationsController.createNewReservation
);

module.exports = router;
