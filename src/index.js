const express = require('express');
const app = express();

const { PORT } = require('./config/serverConfig');
const apiRoutes = require('./routes/index');

const setUpAndStartServer = () => {

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api', apiRoutes);
    
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);

        if(process.env.DB_SYNC) {
            db.sequelize.sync({ alter: true });
        }
    })
}

setUpAndStartServer();