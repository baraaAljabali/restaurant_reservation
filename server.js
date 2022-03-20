/**
 * This is the App intry point
 * the server is created here and bind to the routes in the app file
 */

const app = require("./app");
const http = require("http");

/**
 * Start server error handler
 * @param error thrown error
 */
const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};


const port = process.env.PORT || 3000

app.set("port", port);
const server = http.createServer(app);

server.on("error", onError);
server.listen(port, () => {
    console.log(
        '\x1b[34m',
        '         Sary Restaurant Reservation'
    );
    console.log(
        '\x1b[31m',
        '***',
        '\x1b[0m',
        'The server is running on port 3000',
        '\x1b[31m', '***\n'
    );
});
