const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services/index');
const {createChannel, publishMessage} = require('../utils/messageQueue');
const { REMINDER_BINDING_KEY } = require('../config/serverConfig');

const bookingService = new BookingService();

class BookingController{
    constructor() {

    }

    async sendToMessageQueue(req, res) {
        try {
            const channel = await createChannel();
            const payload = {
                data : {
                    subject: 'This is a notification from queue',
                    content: 'some queue will subscribe this',
                    recepientEmail: 'dhavalbathe01@gmail.com',
                    notificationTime: '2025-10-01T11:30:00.000Z',
                },
                service: 'CREATE_TICKET',
            };
            publishMessage(channel, REMINDER_BINDING_KEY, JSON.stringify(payload));
            return res.status(200).json({
                message: "Successfully published the event",
            });
        } catch (error) {
            throw error;
        }
    }

    async create(req, res) {
        try {
            const response = await bookingService.createBooking(req.body);
            return res.status(StatusCodes.OK).json({
                data: response,
                success: true,
                message: "Successfully booked flight",
                err: {}
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                data: {},
                success: false,
                message: error.message,
                err: error.explanation
            });
        }
    }
}

module.exports = BookingController;