import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose initiate
mongoose.connect("mongodb://localhost:27017/todolistDB")
.then(() => console.log('Connected!'));

const itemSchema = new mongoose.Schema({
    name : String
});

const Task = mongoose.model('Task' , itemSchema );

const task1 = new Task ({
    name : 'Welcome to ToDo List.'
});

const task2 = new Task ({
    name : 'Hit the + button to add tasks.'
});

const task3 = new Task ({
    name : 'Hit this to delete a task. --->'
});

const defaultItems = [task1 , task2 , task3];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model("List" , listSchema);

// mongoose end

// var tasksList = [];

app.post("/submit", (req,res) => {
    var newTask = req.body["tasks"];
    const listName = req.body.list; 

    const item = new Task({
        name : newTask
    });
    
    if (listName === "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName})
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err)=>{
        console.log(err);
      })
    }
});

app.get("/", (req, res) => {
  Task.find({})
    .then((foundTask) => {
      if (foundTask.length === 0) {
        Task.insertMany(defaultItems)
          .then(function () {
            console.log("Added Successfully");
          })
          .catch(function (err) {
            console.log(err);
          });
          res.redirect("/"); // so that it agains check for DB items
      } else {
        // console.log(foundTask);
        res.render("index.ejs", {
          day: "Today",
          task: foundTask,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});


app.get("/:customListName" , (req,res)=>{
  console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName})
  .then((foundList) =>{
    if (!foundList){
      console.log("doesnt exist");
      // create a new list
      const list = new List({
        name : customListName,
        items : defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    } else {
      console.log("exist");
      // show an existing list
      res.render("index.ejs", {
        day: foundList.name ,
        task: foundList.items
      });
    }
  })
  .catch((err) => {
    console.log(err);
  });

});


app.post("/removeTask" , (req,res)=> {

  const listName = req.body.listName;
  
  if (listName === "Today") {
    console.log(req.body.delete);
    Task.findByIdAndDelete(req.body.delete)
      .then((deletedTask) => {
        console.log("deleted :", deletedTask);
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name : listName} ,
      {$pull : {items : {_id : req.body.delete} }})
    .then((foundList)=>{
      // console.log(foundList);
      res.redirect("/" + listName);
    })
    .catch((err)=>{
      console.log(err);
    })
  }
    
});


app.listen(port , ()=> {
    console.log(`Server running on ${port}.`);
});