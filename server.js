const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 2000;

const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server started on port: ${PORT} `);
});
