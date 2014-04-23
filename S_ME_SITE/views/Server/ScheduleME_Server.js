/**
 * Created by hytead on 4/15/14.
 */
    
// Load the node-router library by creationix
var server = require('./node-router').getServer();

// Configure our HTTP server to respond with Hello World the root request
server.get("/", function (request, response) {
    response.simpleHtml(200, 'Welcome To SCHEDULEME!');
});
server.get("/andrew", function (request, response) {
    response.simpleHtml(200, "Hello, Andrew!");
});
server.get("/jordan", function (request, response) {
    response.simpleHtml(200, "<!DOCTYPE html> <html> <body><style>body {background-color:lightgrey;}p {color:blue;}" +
        "</style> <h1>Hello Jordan</h1> <p>This is how we'll do routing.</p>" +
        "<p>It even works with HTML.</p> </body> </html>");
});

// Listen on port 30000 on localhost
server.listen(30000, "localhost");