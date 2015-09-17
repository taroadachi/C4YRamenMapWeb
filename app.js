
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);
var mysql = require('mysql');                               //ＤＢ接続用ライブラリを読み込む
var connection = mysql.createConnection({                   //ＤＢに接続する
    host: 'ja-cdbr-azure-east-a.cloudapp.net',              //メモ帳にコピーしたホスト名
    user: 'bb4d9882593378',                                 //メモ帳にコピーしたユーザ名
    password: '364ea756',                                   //メモ帳にコピーしたパスワード
    database: 'taroadachi'                                   //メモ帳にコピーしたデータベース名
});
 
// http://～～～/post でアクセスされた時の処理(口コミ投稿時にブラウザから呼び出される処理)
app.get('/post', function (req, res) {
    var sql = "insert into t_comments(lon, lat, time, nickname, comment) values(?, ?, ?, ?, ?)";        //SQLでinsert文(行の追加)
    var dt = new Date().toISOString().slice(0, 19).replace('T', ' ');                                   //日付を変換
    connection.query(sql, [req.query.lon, req.query.lat, dt, req.query.nickname, req.query.comment]);   //データを割り当ててSQL実行
    res.send('Success');
});
 
// http://～～～/get でアクセスされた時の処理(口コミ取得時にブラウザから呼び出される処理)
app.get('/get', function (req, res) {
    var sql = "select * from t_comments where lon = ? and lat = ? order by time desc";                  //SQLでselect文(行の取得)
    connection.query(sql, [req.query.lon, req.query.lat], function (err, rows) {                        //条件を割り当ててSQL実行
        res.contentType('application/json');
        var json = JSON.stringify(rows);                                                                //結果(rows)をJSON(文字列)化
        res.send(json);                                                                                 //それをブラウザに返す
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
