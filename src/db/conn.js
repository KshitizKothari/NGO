var credientials =require("./credentials");

const mongoose =require("mongoose");

const URI = `mongodb://${credientials.DB_USERNAME}:${credientials.DB_PASSWORD}@cluster0-shard-00-00.pfbcq.mongodb.net:27017,cluster0-shard-00-01.pfbcq.mongodb.net:27017,cluster0-shard-00-02.pfbcq.mongodb.net:27017/${credientials.DATABASE}?ssl=true&replicaSet=atlas-waesu8-shard-0&authSource=admin&retryWrites=true&w=majority`;
// ------------databse connection----------------
mongoose.connect(URI, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
//    useCreateIndex:true

}).then(() => {
    console.log(`connection successful`);

}).catch((e) => {
    console.log(e);

})

module.exports={URI}
