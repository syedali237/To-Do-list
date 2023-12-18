import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const month = monthName[new Date().getMonth()];

const date = new Date().getDate();

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday" , "Friday", "Saturday"];
const dayName = weekDays[new Date().getDay()];

var tasksList = [];

app.post("/submit", (req,res) => {
    var newTask = req.body["tasks"];
    tasksList.push(newTask);
    res.redirect("/");
});

app.get("/" , (req,res) => {
    res.render("index.ejs", {
        monthOfDate : month , dateOfDay : date , 
        day : dayName , task : tasksList
    });
});

app.post("/removeTask" , (req,res)=> {
    if (req.body.delete){
        // assignign index value for elements in array
        var index = tasksList.indexOf(req.body.delete);
        //checking the index of an array 
        console.log(tasksList);
        console.log(req.body.delete);
        console.log(index); 
        if (index > -1){
            //splice used to remove the array element
            tasksList.splice(index, 1);
        }
    }
    res.redirect("/");
});


app.listen(port , ()=> {
    console.log(`Server running on ${port}.`);
});