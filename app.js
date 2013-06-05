/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);


var elevator = {
    floor: 0,
    state: 'CLOSE',
    people: {},
    toString: function () {
        return "Current floor: " + this.floor + " - Current state: " + this.state;
    }
};

var floors = {};


app.get('/call', function (req, res) {
    var atFloor = req.query.atFloor,
        to = req.query.to;

    if (floors[atFloor]) {
        floors[atFloor].calls.push(to);
    } else {
        floors[atFloor] = {calls: [to]};
    }

    console.log("URL: " + req.url + " - " + elevator.toString());

    res.send(200);
});

app.get('/go', function (req, res) {
    if (elevator.people[req.query.floorToGo]) {
        elevator.people[req.query.floorToGo] = elevator.people[req.query.floorToGo] + 1;
    } else {
        elevator.people[req.query.floorToGo] = 1;
    }

    delete floors[elevator.floor].calls[0];

    res.send(200);
});

app.get('/nextCommand', function (req, res) {
    var floor = floors[elevator.floor];
    if (floor) {
        elevator.state = 'OPEN'
    } else {
        for (var i = 0; i < 6; i++) {
            if (floors[i]) {
                if (elevator.floor < i) {
                    elevator.state = 'UP';
                    elevator.floor = elevator.floor + 1;
                } else {
                    elevator.state = 'DOWN';
                    elevator.floor = elevator.floor - 1;
                }

                break;
            }
        }
    }


    console.log("URL: " + req.url + " - " + elevator.toString());

    res.send(elevator.state);
});

app.get('/userHasEntered', function (req, res) {
    res.send(200);
});

app.get('/userHasExited', function (req, res) {
    res.send(200);
});

app.get('/reset', function (req, res) {
    elevator.floor = 0;
    elevator.state = 'CLOSE';

    res.send(200);
});


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
