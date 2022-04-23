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

const types = { html: 'html', css: 'css', js: 'javascript' };

const server = http.createServer((request, response) => {
    const url = request.url;
    let pathToFile = url === '/' ? '/src/index.html' : `/src${url}`;
    let contentType = "text/html";

    const fileExtension = url.split('.').pop();

    if(types[fileExtension]) {
        contentType = `text/${types[fileExtension]}`;
    }
    
    fs.readFile(__dirname + pathToFile, (error, data) => {
        if(error) {
            response.writeHead(404, {'Content-type': 'text/plain'});
            return response.end(`File ${pathToFile} not found!`);
        }

        response.writeHead(200, {'Content-type': contentType});
        response.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    
    childp.exec(`${start} http://${host}:${port}`);
});
