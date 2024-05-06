

const http = require('http');
const url = require('url');
const querystring = require('querystring');

function onRequest(req, res) {
  const path = url.parse(req.url).pathname;
  console.log('Request for ' + path + ' received');

  if (req.method === 'GET' && path === '/login') {
    const query = url.parse(req.url).query;
    console.log(query);
    const params = querystring.parse(query);
    const username = params["username"];
    const id = params["id"];
    const branch = params["branch"];
    const mobileNo = params["phno"];
    const gender = params["gender"];
    const branchadd = params["branchadd"];
    const htmlResponse = `
      <html>
      <head>
      <title>User Details</title>
      <style>
        table {
          font-family: Arial, sans-serif;
          border-collapse: collapse;
          width: 50%;
          margin: 20px auto;
        }
        td, th {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2;
        }
        h2{
            text-align:center;
           
        }
      </style>
      </head>
      <body>
      <h2>User Details</h2>
      <table>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Username</td>
          <td>${username}</td>
        </tr>
        <tr>
          <td>ID</td>
          <td>${id}</td>
        </tr>
        <tr>
          <td>Branch</td>
          <td>${branch}</td>
        </tr>
        <tr>
          <td>Mobile No</td>
          <td>${mobileNo}</td>
        </tr>
        <tr>
          <td>Gender</td>
          <td>${gender}</td>
        </tr>
        <tr>
          <td>Branch Address</td>
          <td>${branchadd}</td>
        </tr>
      </table>
      </body>
      </html>
    `;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(htmlResponse);
    res.end();
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found');
    res.end();
  }
}

http.createServer(onRequest).listen(2000);
console.log('Server is running...');

