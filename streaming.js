var twitter = require('twitter');
var sqlite3 = require('sqlite3').verbose();
var settings = require('./settings');

var client = new twitter({
  consumer_key: settings.consumer_key,
  consumer_secret: settings.consumer_secret,
  access_token_key: settings.access_token_key,
  access_token_secret: settings.access_token_secret
});

var db = new sqlite3.Database('rinna.db');

client.stream('statuses/filter', {track: '@rinna_voice'},  function(stream) {
  stream.on('data', function(tweet) {
    db.serialize(function() {
      db.run('CREATE TABLE IF NOT EXISTS tweets (id_str TEXT PRIMARY KEY, text TEXT, source TEXT, truncated TEXT, in_reply_to_status_id_str TEXT, in_reply_to_user_id_str TEXT, in_reply_to_screen_name TEXT, created_at TEXT, timestamp_ms TEXT)');
      var stmt = db.prepare('INSERT INTO tweets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(tweet.id_str, tweet.text, tweet.source, tweet.truncated, tweet.in_reply_to_status_id_str, tweet.in_reply_to_user_id_str, tweet.in_reply_to_screen_name, tweet.created_at, tweet.timestamp_ms);
      stmt.finalize();
    });
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
