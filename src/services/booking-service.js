const axios = require('axios');

const { BookingRepository } = require("../repository");
const { ServiceError } = require('../utils/errors');
const { FLIGHT_SERVICE_PATH, AUTH_SERVICE_PATH, REMINDER_BINDING_KEY } = require('../config/serverConfig');
const { createChannel, publishMessage } = require('../utils/messageQueue');

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data) {
        try {
            const flightId = data.flightId;
            console.log("in the booking flight service");
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            const priceOfTheFlight = flightData.price;
            if(data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError('Something went wrong in the booking service', 'Insufficient seats in the flight');
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = {...data, totalCost};

            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${booking.flightId}`;
            await axios.patch(updateFlightRequestURL, { totalSeats: flightData.totalSeats - booking.noOfSeats });
            const finalBooking = await this.bookingRepository.update(booking.id, { status: "Booked" });

            if(finalBooking.status === 'Booked') {
                const getUserDataURL = `${AUTH_SERVICE_PATH}/api/v1/user/${finalBooking.userId}`;
                console.log(getUserDataURL);
                const user = await axios.get(getUserDataURL);

                const getFlightDataURL = `${FLIGHT_SERVICE_PATH}/api/v1/flight/${finalBooking.flightId}`;
                const flight = await axios.get(getFlightDataURL);
                const flightData = flight.data.data;

                const getDepartureCityURL = `${FLIGHT_SERVICE_PATH}/api/v1/city/${flightData.departureAirportId}`;
                const responseDepartureCity = await axios.get(getDepartureCityURL);
                const departureCity = responseDepartureCity.data.data.name;

                const getArrivalCityURL = `${FLIGHT_SERVICE_PATH}/api/v1/city/${flightData.arrivalAirportId}`;
                const responseArrivalCity = await axios.get(getArrivalCityURL);
                const arrivalCity = responseArrivalCity.data.data.name;

                if(user.data.success) {
                    const payload = {
                        data: {
                            subject: 'Your Flight Ticket is Booked!',
                            content: `Dear ${user.data.email}, Your booking for ${flightData.flightNumber} from ${departureCity} to ${arrivalCity} on ${flightData.departureTime.split('T')[0]} at ${flightData.departureTime.split('T')[1].slice(0, 5)} has been successfully confirmed. Booking ID: ${finalBooking.id} Booked Seats: ${finalBooking.noOfSeats} Thank you for choosing SkyAir!`,
                            recepientEmail: `${user.data.data.email}`,
                            status: 'PENDING',
                            notificationTime: new Date().toISOString(),
                        },
                        service: 'CREATE_TICKET'
                    }
                    const channel = await createChannel();
                    await publishMessage(channel, REMINDER_BINDING_KEY, payload);
                }
            }
            return finalBooking;
        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError') {
                throw error;
            }
            throw new ServiceError();
        }
    }
}

module.exports = BookingService;