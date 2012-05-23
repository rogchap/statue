var http = require('http'),
	path = require('path'),
	mime = require('mime'),
  util = require('util'),
	fs = require('fs');

exports.run = function(args) {
  var arg, port;
  while (arg = args.shift()) {
    if (arg === "--help" || arg === "-h" || arg === "-?") {
      return help();
    } else if (arg === "--port" || arg === "-p") {
      port = args.shift();
    }
  }
  if (!port) {
    port = 4444;
  }
  http.createServer(function(req, res){
    var filePath = req.url;
    path.exists(filePath, function(exists){
      if (exists) {
        fs.readFile(filePath, function(err, data){
          if (err) {
            res.writeHead(500);
            res.end("500: Issue reading file - " + filePath);
          } else {
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
            res.end(data, 'utf-8');
          }
        });
      } else {
        res.writeHead(404);
        res.end("404: File not found");
      }
    });
  }).listen(port);
  console.log('Statue running at http://localhost:%s/', port);
};

var print = function(m, n) { util.print(m+(!n?"\n":"")); return print; };

var help = function() {
  print
    ("")
    ("Statue: Simple web server to serve static pages locally.")
    ("")
    ("Usage:")
    ("  statue [options]")
    ("")
    ("Options:")
    ("  -p|--port <portNumber>")
    ("    The port number the web server listens on.")
    ("    Default is 4444")
    ("");
};

