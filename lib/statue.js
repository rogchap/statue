var http = require('http'),
	path = require('path'),
	mime = require('mime'),
  util = require('util'),
	fs = require('fs'),
  ejs = require('ejs');

exports.run = function(args) {
  var arg, port, dir, pkg;
  
  pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));

  while (arg = args.shift()) {
    if (arg === "--help" || arg === "-h" || arg === "-?") {
      return help();
    } else if (arg === "--version" || arg === "-v") {
      return util.print(pkg.version + '\n');
    } else if (arg === "--port" || arg === "-p") {
      port = args.shift();
    }  else if (arg === "--dir" || arg === "-d") {
      dir = args.shift();
    }
  }
  if (!port) {
    port = 4444;
  }
  if (!dir) {
    dir = process.platform === 'win32' ? 'c:' : '';
  }

  http.createServer(function(req, res){
    var filePath = decodeURI(req.url);
    if(filePath === '/statue-style.css' || filePath.indexOf('/font/') === 0) {
      filePath = path.join(__dirname, 'statue-dir',  filePath);
    } else {
      filePath = path.join(dir, filePath);
    }

    fs.stat(filePath, function(err, stats){
      if(!stats) return error404(res, filePath);
      if(stats.isDirectory()) {

        var options = {
            version:pkg.version,
            path:filePath.replace(dir,''),
            parentPath:path.dirname(filePath).replace(dir,''),
            size:stats.size,
            mtime:stats.mtime,
            children:[]
          };

        fs.readdir(filePath, function(err, files){

          var fileData = function(i){
            if(i < files.length) {
              var child = files[i];
              var childPath = path.join(filePath, child);
              fs.stat(childPath, function(err, stats){
                if(err){
                  console.log('ignoring file: ', child, err, '\n');
                } else {

                  options.children.push({
                    name:child,
                    path:childPath.replace(dir,''),
                    size:stats.size,
                    mtime:stats.mtime,
                    type:stats.isDirectory() ? 0 : 1
                  });
                }
                fileData(i+1);
              });
            } else {
              fs.readFile(path.resolve(__dirname, 'statue-dir','directory.html'), function(err, data){
                if(err) return error500(res, filePath);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(ejs.render(data.toString(), options), 'utf-8');
              });
            }
          };

          fileData(0);
          
        });
      } else if (stats.isFile()) {
        
        fs.readFile(filePath, function(err, data){
          if(err) return error500(res, filePath);
          
          res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
          res.end(data, 'utf-8');
        });
      } else {
        res.writeHead(404);
        res.end("404: File not found");
      }
    });
  }).listen(port);
  console.log('Statue running at http://localhost:%s/', port);
};

var error500 = function(res, filePath) {
  res.writeHead(500);
  res.end("500: Issue reading file - " + filePath);
};

var error404 = function(res, filePath) {
  res.writeHead(404);
  res.end("404: File not found");
}

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
    ("  -h|-?|--help")
    ("    Displays this help.")
    ("")
    ("  -v|--version")
    ("    Displays the statue version number.")
    ("")
    ("  -p|--port <portNumber>")
    ("    The port number the server listens on.")
    ("    Default is 4444")
    ("")
    ("  -d|--dir <homeDirectory>")
    ("    The home directory the server lists from.")
    ("    Default is / (c: for windows)")
    ("");
};

