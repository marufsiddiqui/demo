var tungus = require('tungus');
var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var request = require('request');
require('./models');
var Model = mongoose.model('Model');
var Cron = mongoose.model('Cron');

mongoose.connect('tingodb://' + __dirname + '/data');

var scraperjs = require('scraperjs');

function updateOne(model, cb) {
  var url = model.url;
  console.log('Now scarapping ' + url);

  scraperjs.StaticScraper.create(url)
    .scrape(function ($) {
      var formattedData = {};

      $('.mmbio .stat').each(function () {
        var $this = $(this);
        var bTags = $this.find('b');
        var txt = '';

        var prop = bTags.text().toLowerCase().split(' ').join('_').replace(':', '');

        bTags.remove();

        if (prop === 'model_rankrating:') {
          txt = $this.text().trim().match(/(\d+\.?\d+)/ig);
          formattedData.model_rank = txt && txt[0] ? txt[0]: 9999;
          formattedData.rating = txt && txt[1] ? txt[1]: 0;;
        } else if (prop === 'birthdate') {
          txt = $this.find('script').text().match(/\(([^)]+)\)/);
          formattedData[prop] = txt ? txt[1] : new Date();
        } else if (prop === 'biography') {
          formattedData[prop] = $this.next().html();
        } else if (prop === 'categories' || prop === 'appearances') {
          var arr = [];
          $this.find('a').each(function () {
            arr.push($(this).text());
          });
          formattedData[prop] = arr;
        } else {
          formattedData[prop] = $this.text().trim();
        }
      });

      function _getSimilar() {
        var arr = [];
        $('.similarmodels').each(function () {
          arr.push($(this).text());
        });
        return arr;
      }

      formattedData.similar = _getSimilar();
      //console.log(formattedData);

      return formattedData;
    }, function (model) {
      model.lastVisited = Date.now();
      model.lastStatus = true;
      Model.findOneAndUpdate({url: url}, model, function (err, doc) {
        if (err) {
          console.log(err);
        }
        console.log(doc);
        cb();
      })
    });
}


var BASE_URL = 'http://www.lanasbigboobs.com/models/';

function _reloadFromServer() {
  scraperjs.StaticScraper.create(BASE_URL + 'model_all.php')
    .scrape(function ($) {
      var models = [];
      $('[onmouseout="closeThumbnail();"]').map(function () {
        models.push({
          url: $(this).attr('href'),
          name: $(this).text()
        });
      });

      return models;
    }, function (models) {
      models.forEach(function (model) {
        new Model(model).save(function (err, doc) {
          if (err) {
            console.log('error while saving + ' + model.name);
          }
        });
      });
      console.log(models);

    });
}

function main() {
  Model.find().limit(1).exec(function (err, docs) {
    console.log(docs.length);
    async.eachLimit(docs, 10, _downloadImage, function(e){
      if (e)
      console.log(e);
      else 
        console.log('done');
    })
  })
}

function _downloadImage(model, cb) {
  var url = model.url;
  var base = url.replace('index.html', '')
  var subBase = base.replace(BASE_URL, '');
  console.log('Now scarapping ' + url);

  scraperjs.StaticScraper.create(url)
    .scrape(function ($) {
      var $img = $('#mmimg');
      if ($img.length) {
        return $img.attr('src');
      } else {
        return null;
      }
    }, function (imgSrc) {
      var fileName = './images/' + subBase + imgSrc;
      request(base + imgSrc).pipe(fs.createWriteStream(fileName));
      console.log(fileName)
    });
}

function _getImg(model, cb) {
  var url = model.url;
  var base = url.replace('index.html', '');
  console.log('Now scarapping ' + url);

  scraperjs.StaticScraper.create(url)
    .scrape(function ($) {
      var $img = $('#mmimg');
      if ($img.length) {
        return $img.attr('src');
      } else {
        return null;
      }
    }, function (imgSrc) {
      var model = {};
      model.image = imgSrc;
      model.lastVisited = Date.now();
      model.lastStatus = true;
      Model.findOneAndUpdate({url: url}, model, function (err, doc) {
        if (err) {
          console.log(err);
        }
        console.log(doc);
        cb();
      })
    });
}

function _test() {
  Model.find({url: 'http://www.lanasbigboobs.com/models/a/abbey_brooks/index.html'}, function (err, doc) {
    console.log(err);
    console.log(doc.length);
  });
}

main();