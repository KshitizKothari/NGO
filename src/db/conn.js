const mongoose =require("mongoose");

// ------------databse connection----------------
mongoose.connect("mongodb+srv://ngo-user:ngouser@cluster0.pfbcq.mongodb.net/NGO?retryWrites=true&w=majority", {
    useNewUrlParser:true,
    useUnifiedTopology:true,
   // useCreateIndex:true

}).then(() => {
    console.log(`connection successful`);

}).catch((e) => {
    console.log(e);

})

