var tungus = require('tungus');
var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var request = require('request');

var download = function(uri, callback){
  console.log('Download file > ' + uri);
  var filename = __dirname + '/pussy/' + Date.now() + uri.split('/').pop();
  request.head(uri, function(err, res, body){
    //console.log('content-type:', res.headers['content-type']);
    //console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var downloadAll = function  () {
  fs.readFile('links.json', 'utf8', function (err, data) {
    if (err) {
      console.log('Error: ' + err);
      return;
    }
   
    var links = JSON.parse(data);

    async.eachSeries(links, download, function (err) {
      if (err) {
        console.log(err);
      }
    })
   
    //console.dir(data);
  });
}
downloadAll();
//require('./models');
//var Model = mongoose.model('Model');

//mongoose.connect('tingodb://' + __dirname + '/data');

var scraperjs = require('scraperjs');

var BASE_URL = 'http://pussystack.tumblr.com/archive/';
function _getLinks() {
  var i = 0;
  var offset = 0;
  var links = [];
  async.whilst(
    function () { return offset <= 900; },
    function (next) {
      console.log('Visiting offset: ' + offset);
      request.get('http://api.tumblr.com/v2/blog/pussystack.tumblr.com/posts/photo?api_key=fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4&offset=' + offset, function(a,b,c){
        var body = JSON.parse(c);
        
        _.each(body.response.posts, function(post) {
          _.each(post.photos, function(photo) {
            //links.push(photo);
            links.push(photo.original_size.url);
          });
        });
        
        offset += 20;
        next();
      });
    },
    function(e) {
      if (!e) {
      console.log('done');
        fs.writeFile('links.json', JSON.stringify(links, null, 4), function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log("JSON saved to " + 'outputFilename');
            }
        }); 
        //console.log(links);
      } else {
        console.log(e);
      }
      
    }
  );
}

//_getLinks();

function getUrls() {
  var map = {
    '2012': [1,3,7,8],
    '2013': [1,5,6,7,11],
    '2014': [1]
  }
  var urls = [];
  
  _.each(map, function(val, key){
    _.each(val, function(month) {
      urls.push(BASE_URL + key + '/' + month);
    })
  });
}