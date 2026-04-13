// require("dotenv").config({
//     path: './env'
// });
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error in Express app:", error);
    });

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);   
})

































// import express from "express";

// const app = express();

// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         console.log("Connected to MongoDB");

//         app.on("error", (error) => {
//             console.log("Error in Express app:", error);
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     }
// })()