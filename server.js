var express = require('express');
var fs = require('fs');
var io = require('socket.io');
var _ = require('underscore');
var Mustache = require('mustache');

var app = express.createServer();
var staticDir = express.static;

io = io.listen(app);

var opts = {
    port: 1947,
    baseDir: __dirname + '/app/'
};
var os = require('os');

function getAddresses(cb) {
    var interfaces = os.networkInterfaces();
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                cb(address.address);
            }
        }
    }
}

io.sockets.on('connection', function (socket) {
    socket.on('slidechanged', function (slideData) {
        socket.broadcast.emit('slidedata', slideData);
    });
    socket.on('fragmentchanged', function (fragmentData) {
        socket.broadcast.emit('fragmentdata', fragmentData);
    });
    socket.on('remote_connected', function () {
        console.log('remote connected');
    });
    socket.on('remote', function (data) {
        console.log('remote command', data);
        io.sockets.in('offerer').emit('remote_command', data);
    });
    socket.on('rtc_init_receiver', function (data) {
        console.log('received joined');
        this.join('receiver');
    });

    socket.on('rtc_init_offerer', function (data) {
        console.log('offerer has joined');
        this.join('offerer');
    });

    socket.on('rtc_answer', function (data) {
        console.log(data);
        io.sockets.in('offerer').emit('rtc_answer', data);
    });

    socket.on('rtc_request', function (data) {
        console.log(data);
        io.sockets.in('receiver').emit('rtc_request', data);
    });
});

function getPatch($Url) {

    if ($Url === undefined) {
        return 'app/slides';
    }

    var $split_url = $Url.split(':' + opts.port + '/');
    return $split_url[1] === '' ? 'slides' : $split_url[1];
}

app.get("/", function (req, res) {
    fs.createReadStream(opts.baseDir + 'slides/index.html').pipe(res);
});

app.get("/speaker", function (req, res) {
    fs.createReadStream(opts.baseDir + 'speaker/index.html').pipe(res);
});

app.get("/css/*", function (req, res) {
    fs.createReadStream(opts.baseDir + 'assets/css/' + req.params[0]).pipe(res);
});

app.get("/js/*", function (req, res) {
    fs.createReadStream(opts.baseDir + 'assets/js/' + req.params[0]).pipe(res);
});

app.get("/templates/*", function (req, res) {
    fs.createReadStream(opts.baseDir + getPatch(req.headers.referer) + '/templates/' + req.params[0]).pipe(res);
});

app.get("/fonts/*", function (req, res) {
    fs.createReadStream(opts.baseDir + 'assets/fonts/' + req.params[0]).pipe(res);
});

// Actually listen
app.listen(opts.port || null);

var brown = '\033[33m',
        green = '\033[32m',
        reset = '\033[0m';

var slidesLocation = "http://localhost" + (opts.port ? (':' + opts.port) : '');

console.log(brown + "reveal.js - WebRTC Server and socket.io remote control" + reset);
getAddresses(function (address) {
    console.log('Your server is listening on http://' + address + ':1947/');
});
