const server = require('./src/network/server');
const port = process.env.PORT || 3535;
server.runServer(port);
