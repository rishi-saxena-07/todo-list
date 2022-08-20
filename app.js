//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rishi:Test123@cluster0.prgb3ps.mongodb.net/todolistDB");

const iteamsSchema = {
  name : String
};

const Item = mongoose.model("Item", iteamsSchema);

const buyFood = new Item({
  name :"Buy Food"
});

const cookFood = new Item({
  name : "Cook Food"
});

const eatFood = new Item({
  name : "Eat Food"
});

const defaultItems = [buyFood, cookFood, eatFood];

const listSchema = {
  name : String,
  items : [iteamsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){

  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Succesfully saved default iteams to DB.");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});

});

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemPost = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemPost
  });

  if( listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("selected iteam has deleted from the list");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started  Succesfully");
});
