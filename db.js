const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.Promise = Promise;

const db = 'mongodb://localhost:27017/wikiDB';

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex:true
      })
  
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
connectDB;

const articleSchema = new mongoose.Schema({ 
    title: String,
    content: String 
  });
  
const Article = mongoose.model("Article", articleSchema);

module.exports = Article;