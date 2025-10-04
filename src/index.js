const express = require('express');
const morgan = require('morgan');
const app = express();

const { PORT } = require('./config/serverConfig');
const apiRoutes = require('./routes/index');
const db = require('./models/index');

const setUpAndStartServer = () => {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/bookingRequest/api', apiRoutes);

    app.get('/bookingRequest/api/v1/test', (req, res) => {
        res.status(200).json({message: "testing successfull"});
    })

    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);

        if(process.env.DB_SYNC) {
            db.sequelize.sync({ alter: true });
        }
    })
}

setUpAndStartServer();