var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var amqp = require('amqplib/callback_api');
var port = process.env.PORT;
var rabbitmq = process.env.RABBITMQ_BIGWIG_URL;
var mongodb = process.env.MONGODB_URI;


app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());//for parsing application/json
app.use(bodyParser.urlencoded({extended: true}));//for parsing application/x-ww-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data
app.use(express.static('public'));

app.post('/', function(req, res){

	amqp.connect(rabbitmq, function(err, conn) {
  	conn.createChannel(function(err, ch) {
    var q = 'hello';
    var msg = JSON.stringify(req.body.URL);
   	var noQuote = msg.split('"').join('');
   	var msg2 = JSON.stringify(req.body.term);
   	var noQuote2 = msg2.split('"').join('');

    ch.assertQueue(q, {durable: false});
    // Note: on Node 6 Buffer.from(msg) should be used
    ch.sendToQueue(q, new Buffer(noQuote));
    ch.sendToQueue(q, new Buffer(noQuote2));
    console.log(" [x] Sent %s", noQuote);
    console.log(" [x] Sent %s", noQuote2);
  });
  setTimeout(function() { conn.close(); process.exit(0) }, port);
});

	res.send("recieved your request");

});

app.get('/', function(req, res){
    res.render('form');
});

app.listen(port || 5000)