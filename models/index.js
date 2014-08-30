var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**

 things to do
 Name:
 Aliases:
 Model Rank:
 Rating
 Cupsize:
 Boob:
 Body type
 Hair color:
 Birthday:
 Categories : [array, linkable]
 Bio:
 Appearances:

 Galleries:
 videos:
 Similar Models:
 Webcams

 */
/**
 * Console schema
 */

var ModelSchema = Schema({
  name: String,
  image: String,
  aliases: String,
  model_rank: Number,
  rating: Number,
  cup_size: String,
  boobs: String,
  body_type: String,
  hair_color: String,
  birthdate: Date,
  categories: [String],
  biography: String,
  appearances: [String],
  galleries: [String],
  videos: [String],
  similar: [String],
  lastVisited: Date,
  dateAdded: {
    type: Date,
    default: Date.now
  },
  url: { type: String, unique: true },
  lastStatus: Boolean
});

mongoose.model('Model', ModelSchema);

var CronSchema = Schema({

});

mongoose.model('Cron', CronSchema);
