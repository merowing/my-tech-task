const http = require('http');
const fs = require('fs');
const childp = require('child_process');

const host = 'localhost';
const port = '3000';

let start = 'start';
switch(process.platform) {
    case 'darwin':
        start = 'open';
        break;
    case 'win32':
        start = 'start';
        break;
    default:
        start = 'xdg-open';
}

const server = http.createServer((request, response) => {
    fs.readFile(__dirname + "/src/index.html", (error, data) => {
        if(error) {
            response.writeHead(500);
            response.end(error);
            return;
        }

        response.setHeader("Content-type", "text/html");
        response.writeHead(200);
        response.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    
    childp.exec(`${start} http://${host}:${port}`);
});
