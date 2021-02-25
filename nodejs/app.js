var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var mysql = require("mysql");
const cors = require('cors');
var radio = require("radio-stream");
const xml2js = require('xml2js');
var http = require('http');
var unirest = require("unirest");


const parser = new xml2js.Parser({ attrkey: "ATTR" });

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


app.post('/stream', async (requ, resp) => {



  let url = requ.query.url;
  let recupType = requ.query.type;
  let data ;
  let stream = radio.createReadStream(url);

  if (recupType === 'icecast' ){

    stream.on("connect", function() {
      //console.error(stream.headers);
    });
    stream.on("data", function(chunk) {
      //console.log(chunk);
    });
    stream.on("metadata", function (title) {

      data = title;
      let meta;
      stream.destroy();

      let response;
      let infos = data.split(';');

      infos[0] = infos[0].substr(13);
      infos[0] = infos[0].replace("';", '');
      infos[1] = infos[1].substr(11);
      infos[1] = infos[1].replace("';", '');
      infos[1] = infos[1].replace("'", '');

      let parts = infos[0].split(' - ');
      if (parts[1]){
        parts[1] = parts[1].replace("'", '');
        let badchar = parts[1].indexOf('§');
        let mauvais = parts[1].substr(badchar);
        parts[1] = parts[1].replace(mauvais, '');
      }

      /*let req = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search");  //appele l'API deezer permettant de récuperer les infos d'une musique sur base du titre/artiste

      req.query({
        "q": parts[0] + ' ' + parts[1]
      });

      req.headers({
        "x-rapidapi-key": "ef99d5b9d0mshede63eed1b8a4b3p1a47c7jsn96b7a775468b",
        "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
        "useQueryString": true
      });


      req.end(function (res) {
        if (res.body.error) throw new Error(res.error);

        if (res.body) {
          console.log(res.body);
          cover = res.body.data[0].album.cover;
          console.log(infos[1]);
          response = {artist: parts[0].trim(), title: parts[1].trim(), cover : cover, radioCover: infos[1]};
          return resp.send(response)
        }
        else {
          response = {artist: parts[0].trim(), title: parts[1].trim()};
          return resp.send(response)
        }
      });*/

      response = {artist: parts[0], title: parts[1], cover : infos[1]};
      return resp.send(response)
    })

  }

  if (recupType === 'shoutcast'){
    stream.on("connect", function() {
      //console.error(stream.headers);
    });
    stream.on("data", function(chunk) {
      //console.log(chunk);
    });
    stream.on("metadata", function (title) {

      data = title;
      stream.destroy();

      let response;
      data = data.substr(13);                                   // Retire StreamTitle='
      data = data.replace("';", '');       // Retire '; a la fin du string
      let parts = data.split('-');                         // Sépare le titre et l'artiste

      console.log(parts[1]);

      /*let cover;
      let req = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search");  //appele l'API deezer permettant de récuperer les infos d'une musique sur base du titre/artiste

      req.query({
        "q": parts[0] + ' ' + parts[1]                                // query pour l'api deezer
      });

      req.headers({
        "x-rapidapi-key": "ef99d5b9d0mshede63eed1b8a4b3p1a47c7jsn96b7a775468b",
        "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
        "useQueryString": true
      });


      req.end(function (res) {
        if (res.body.error) throw new Error(res.error);

        else if (res.body.data[0]) {
          console.log(res.body.data[0].album.cover);
          cover = res.body.data[0].album.cover;                      // récupère l'adresse de la cover
          response = {artist: parts[0].trim(), title: parts[1].trim(), cover : cover};
          return resp.send(response)
        }
        else {
          response = {artist: parts[0].trim(), title: parts[1].trim()}; //si on trouve pas de cover renvois sans
          return resp.send(response)
        }
      });*/

      response = {artist: parts[0].trim(), title: parts[1].trim()};
      resp.send(response);
    })
  }

  if (recupType === 'json'){
    stream.on("connect", function() {
      //console.error(stream.headers);
    });
    stream.on("data", function(chunk) {
     //console.log(chunk);
    });
    stream.on("metadata", function (title) {

      data = title;
      let meta;
      stream.destroy();

      let jsonUrl = data.split(";");
      jsonUrl = jsonUrl[0].substr(13);
      jsonUrl = jsonUrl.replace("'", '');
      jsonUrl = jsonUrl.replace("-", '');
      jsonUrl = jsonUrl.trim();                                                       // on isole l'url

      if(jsonUrl === 'adbreak_end' || jsonUrl === ''){
        let response = {artist: 'pub', title: 'pub'};
        resp.send(response)
      }
      else{
        let req = http.get("http:" + jsonUrl, function (res) {    //on récupère le contenu de la page et le transforme en json
          res.on('data', function (stream) {
            meta += stream;
          });
          res.on('end', function () {
            let infos = meta.split(',');
            infos[1] = infos[1].substr(12);
            infos[1] = infos[1].replace("'", "");
            infos[2] = infos[2].substr(11);
            infos[2] = infos[2].replace("'", "");      // on recrée un object avec les infos intéressantes
            infos[3] = infos[3].substr(11);
            infos[3] = infos[3].replace("'", "");
            let response = {artist: infos[1], title: infos[2], cover: infos[3]};
            resp.send(response)
          });
        });
      }
    })
  }

  if (recupType === 'noInfo'){

    stream.on("connect", function() {
      //console.error(stream.headers);
    });
    stream.on("data", function(chunk) {
      //console.log(chunk);
    });
    stream.on("metadata", async function (title) {
      console.log(title);
      stream.destroy();

      resp.send({artist : 'Various artist', title : 'Unknow title'})
    })
  }


  /*stream.on("connect", function() {
    //console.error(stream.headers);
  });
  stream.on("data", function(chunk) {
   //console.log(chunk);
  });
  stream.on("metadata", async function (title) {

    console.log(title);
    data = title;
    let meta;
    stream.destroy();

    if (data.includes('StreamTitle=\'//') && data.includes('StreamUrl=')) {   // cas où l'on récupère un lien json

      let url = data.split(";");
      url = url[0].substr(13);
      url = url.replace("'", '');
      url = url.trim();                                                           // on isole l'url

      let req = http.get("http:" + url, function (res) {    //on récupère le contenu de la page et le transforme en json
        res.on('data', function (stream) {
          meta += stream;
        });
        res.on('end', function () {
          let infos = meta.split(',');
          infos[1] = infos[1].substr(12);
          infos[1] = infos[1].replace("'", "");
          infos[2] = infos[2].substr(11);
          infos[2] = infos[2].replace("'", "");      // on recrée un object avec les infos intéressantes
          infos[3] = infos[3].substr(11);
          infos[3] = infos[3].replace("'", "");
          let response = {artist: infos[1], title: infos[2], cover: infos[3]};
          resp.send(response)
        });
      });
    }

    else {
      if (data.includes('StreamTitle=') && data.includes('StreamUrl=')) {
        let response;
        let infos = data.split(';');
        infos[0] = infos[0].substr(13);
        infos[0] = infos[0].replace("';", '');
        infos[1] = infos[1].substr(11);
        infos[1] = infos[1].replace("';", '');
        infos[1] = infos[1].replace("'", '');
        let parts = infos[0].split('-');
        if (parts[0] && parts[1] && infos[1]) {
          response = {artist: parts[0].trim(), title: parts[1].trim(), cover: infos[1]};
        } else if (parts[0] && parts[1]){
          response = {artist: parts[0].trim(), title: parts[1].trim()};
        }
        else {
          response = {artist: 'raté', title: 'jsp'};
        }
        return resp.send(response);

      } else if (data.includes('StreamTitle=')) {
        let response;
        data = data.substr(13);                                   // Retire StreamTitle='
        data = data.replace("';", '');       // Retire '; a la fin du string
        let parts = data.split('-');                         // Sépare le titre et l'artiste
        let cover;

        let req = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search");  //appele l'API deezer permettant de récuperer les infos d'une musique sur base du titre/artiste

        req.query({
          "q": parts[0] + ' ' + parts[1]
        });

        req.headers({
          "x-rapidapi-key": "ef99d5b9d0mshede63eed1b8a4b3p1a47c7jsn96b7a775468b",
          "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
          "useQueryString": true
        });


        req.end(function (res) {
          if (res.error) throw new Error(res.error);

          if (res.body.data[0]) {
            console.log(res.body.data[0].album.cover);
            cover = res.body.data[0].album.cover;
            response = {artist: parts[0].trim(), title: parts[1].trim(), cover : cover};
            return resp.send(response)
          }
          else {
            response = {artist: parts[0].trim(), title: parts[1].trim()};
            return resp.send(response)
          }
        });

      }
    }
  });*/
});

let Type = function(){
  this.type = "";
};

Type.prototype = {
  setStrategy: function (type) {
    this.type = type;
  },
  getInfos: function (url) {
    return this.type.getInfos(url);
  }
};

let Direct = function(){
  this.getInfos = function (url) {

  }
};

let Icecast = function() {
  this.getInfos = function (url) {
    let stream = radio.createReadStream(url);

    stream.on("connect", function () {
      //console.error(stream.headers);
    });
    stream.on("data", function (chunk) {
      //console.log(chunk);
    });
    stream.on("metadata",function (title) {


     let data = title;

      console.log(data);
      let meta;
      stream.destroy();

      let response;
      let infos = data.split(';');
      infos[0] = infos[0].substr(13);
      infos[0] = infos[0].replace("';", '');
      infos[1] = infos[1].substr(11);
      infos[1] = infos[1].replace("';", '');
      infos[1] = infos[1].replace("'", '');
      let parts = infos[0].split('-');
      if (parts[0] && parts[1] && infos[1]) {
        response = {artist: parts[0].trim(), title: parts[1].trim(), cover: infos[1]};
      } else if (parts[0] && parts[1]) {
        response = {artist: parts[0].trim(), title: parts[1].trim()};
      } else {
        response = {artist: 'raté', title: 'jsp'};
      }
      console.log(response);
      return response;
    })
  };
};

let Shoutcast = function(){
  this.getInfos = function (url) {

  }
};

app.listen(8888);
