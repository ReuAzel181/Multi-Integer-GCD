const http = require('http');

// Function to handle requests and send a response
const requestListener = function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Multi-Integer GCD Calculator is running!\n');
};

// Create an HTTP server that listens on port 3000
const server = http.createServer(requestListener);
const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
