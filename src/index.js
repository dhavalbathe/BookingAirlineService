const express = require('express');

const { PORT } = require('./config/serverConfig');

const setUpAndStartServer = () => {
    
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);

        if(process.env.DB_SYNC) {
            db.sequelize.sync({ alter: true });
        }
    })
}

setUpAndStartServer();