
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require("lodash")
const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://admin:admin@cluster0.wu6ayr7.mongodb.net/todoDB")
// mongoose.connect("mongodb://localhost:27017/todoDB",{ useNewUrlParser: true });
mongoose.set('strictQuery', true);
const day = date.getDate();
const itemSchema={
  name:{
    type:String,
    Required:true
  }

}
const Items=mongoose.model("Items",itemSchema);
const i1=new Items({
  name:"welcome to do list",
})
const i2=new Items({
  name:"user"
})
const i3=new Items({
  name:"hit + to add"
})
let defaultlist=[i1,i2,i3];
let ListSchema={
  name:String,
  items:[itemSchema]
}
let List=mongoose.model ("List",ListSchema);


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {

  Items.find({},function(err,founditem){
    if(founditem.length===0){
      Items.insertMany(defaultlist,function(err){
        if(err)
        console.log(err);
        else
        console.log("inserted sucessfully");
      })
      res.redirect("/");
    }
 
    else{
        
        res.render("list", {listTitle: day, newListItems: founditem});
    }
  })


});

app.post("/", function(req, res){


  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item=new Items({
    name:itemName
  })
console.log(listname);
console.log(day);
  if (listname=== day) {
    item.save();
    res.redirect("/");
  } else {
   List.findOne({name:listname},function(err,foundlist){
    if(err)console.log(err);
    else{
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    }
   })
  }
});
app.post("/delete",function(req,res){
 
  const Del_item_id=req.body.checkboxData;
  const title=req.body.title
  console.log(Del_item_id);


if(title===day){
  Items.findByIdAndRemove(Del_item_id,function (err) {
    if(err)
    console.log(err);
    else{
    console.log("Deleted Successfully");
    setTimeout(function(){
      res.redirect("/")
    }, 300); 
    }
    })}
    else{
      List.findOneAndUpdate({name:title},{$pull:{items:{_id:Del_item_id}}},function(err){
        if(err)
        console.log(err);
        else
        console.log("deleted suceess");
      })
      setTimeout(function(){
        res.redirect("/"+title);
      }, 300); 
    }
})
app.get("/:CustomListName",function(req,res){
  let listname= _.capitalize(req.params.CustomListName)
List.findOne({name:listname},function(err,foundlist){
  if(err)
  console.log(err);
  else{
    if(!foundlist){
      let list= new List({
        name:listname,
        items:defaultlist
      })
      list.save();
      res.redirect("/"+listname);
    }
    else{
      res.render("list", {listTitle:foundlist.name, newListItems: foundlist.items});
      console.log("exist");
    }
  }
})




})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
