/**
 * Created by hytead on 4/15/14.
 */
    
// Load the node-router library by creationix
var server = require('./node-router').getServer();

// Configure our HTTP server to respond with Hello World the root request
server.get("/", function (request, response) {
    response.simpleHtml(200, var);
});

// Listen on port 30000 on localhost
server.listen(30000, "localhost");