var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var mysql = require("mysql");
const cors = require('cors');
const urlMetadata = require('url-metadata');
var radio = require("radio-stream");

let data ;

// DataBase

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "radioplayer"
});
con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

var app = express();

app.use(cors());

app.get('/radio', async (req, res) => {
  // recupere les valeurs du formulaire
  let sql = 'SELECT * FROM radiolist';
  await con.query(sql, (err, rows) => {
    if (err) throw err;
    return res.json(rows);
  });
});

app.post('/newChannel', async (req, res) => {
  // recupere les valeurs du formulaire
  values = [req.query.name, req.query.url, req.query.type];
  let sql = 'INSERT INTO radiolist (name, url, type) VALUES (\''+ req.query.name + '\',\''+ req.query.url + '\',\''+ req.query.type +'\');';
  await con.query(sql, values,(err, rows) => {
    if (err) throw err;
    return res.send(true);
  });
});

app.get('/radio/:name', async (req, res) => {
  let name = req.url.split('/radio/').pop();
  name = name.replace('%20', ' ');
  console.log(name);
  // recupere les valeurs du formulaire
  let sql = 'SELECT * FROM radiolist where name = \'' + name + "'";
  await con.query(sql, (err, rows) => {
    if (err) throw err;
    return res.json(rows);
  });
});

app.put('/modifyChannel', async (req, res) => {
  // recupere les valeurs du formulaire
  values = [req.query.name, req.query.url, req.query.type, req.query.id];
  let sql = "UPDATE radiolist SET name ='"+ req.query.name + "', url = '"+ req.query.url + "', type = '"+ req.query.type + "' WHERE id ="+ req.query.id;
  await con.query(sql, values,(err, rows) => {
    if (err) throw err;
    return res.send(true);
  });
});

app.delete('/radio/delete/:name', async (req,res) => {
  let name = req.url.split('/radio/delete/').pop();
  name = name.replace('%20', ' ');
  let sql = "DELETE FROM radiolist where name = '" + name + "'" ;
  await con.query(sql, (err, rows) => {
    if (err) throw err;
    return res.send(true);
  });
});


app.post('/stream', async (req, res) => {

  url = req.query.url;
  let data ;

  var stream = radio.createReadStream(url);

  stream.on("connect", function() {
    //console.error(stream.headers);
  });
  //stream.on("data", function(chunk) {
    //process.stdout.write(chunk);
  //});
  stream.on("metadata", function(title) {
    console.log(title);
    data = title;
    stream.destroy();
    return res.send(data);
  });



});



app.listen(8888);
