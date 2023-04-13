const express = require("express");
const dotenv = require("dotenv");
const hospitals = require("./routes/hospitals.js");
const appointments = require("./routes/appointments.js");
const auth = require("./routes/auth.js")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

dotenv.config({path : "./config/config.env"});
connectDB();

const app = express();
const limiter = rateLimit({
    windowsMs : 10 * 60 * 1000, //10 Minutes
    max : 100
})

const swaggerOptions = {
    swaggerDefinition:{
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "A simple Express VacQ API"
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1"
            }
        ],
    },
    apis:["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/appointments", appointments);
app.use("/api/v1/auth", auth);

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log("Server running in ", process.env.NODE_ENV, " mode on port ", PORT));

process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});