const express = require('express');

const { BookingController } = require('../../controllers/index');

const bookingController = new BookingController();
const router = express.Router();

//create new booking 
router.post('/bookings', bookingController.create);

router.post('/publish', bookingController.sendToMessageQueue);

module.exports = router;