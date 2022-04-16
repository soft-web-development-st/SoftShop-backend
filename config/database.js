const mongoose = require('mongoose')

const connectDatabase = () => {

    mongoose
        .connect(process.env.DB_LOCAL_URI,)
        .then(() => console.log("MongoDB Database Conntected"))
        .catch(e => console.log(e));
}


module.exports = connectDatabase