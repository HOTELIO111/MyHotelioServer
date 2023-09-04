const mongoose = require("mongoose");
require('dotenv').config()

// mongodb url  
const mongodb = process.env.MONGO_DB_URL


// connection 
mongoose.connect(mongodb).then(() => {
    console.log("Server Connected to mongodb")
}).catch((error) => {
    console.log(error)
})


module.exports = mongoose