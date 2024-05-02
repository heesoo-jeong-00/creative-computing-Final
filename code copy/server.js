const https = require('https');
const fs = require('fs');
const express = require('express'); 

const app = express();

app.use(express.static('./')); 

// https.createServer({
//   key: fs.readFileSync('key.pem'), 
//   cert: fs.readFileSync('cert.pem') 
// }, app)

https.createServer({
  key: fs.readFileSync('../key.pem'), 
  cert: fs.readFileSync('../cert.pem') 
}, app)


.listen(3000, function () {
  console.log('App listening on port 3000! Go to https://localhost:3000/')
});

