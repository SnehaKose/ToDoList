// jshint esversion:6

require('dotenv').config();
const PORT =process.env.PORT||3000;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require ("mongoose")
const _ =require("lodash");
mongoose.set('strictQuery',false);

const app =express();

//let items=["cook food","eat food"];
//let workItems=[];

//mongoose -DBMS
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));


    mongoose.connect('mongodb+srv://sneha:khanak@atlascluster.nmvrxtr.mongodb.net/todoListDB', {useNewUrlParser: true});
    const itemsSchema ={
        name:String
    }
    const Item =mongoose.model("Item",itemsSchema);
    //creating documents
    const item1 =new Item ({
        name:"Welcome to your todolist!"
    });
    const item2 =new Item ({
        name:"Hit the + button to add new item"
    });
    const item3 =new Item ({
        name:"Checkmark this to delete an item!"
    });
    const defaultItems =[item1,item2,item3];
    
    const listsSchema={
        name:String,
        items:[itemsSchema]
    };
    const List=mongoose.model("List",listsSchema);
    

app.get("/",function(req,res){
        /*let today = new Date();
    
        let options={
            weekday: "long",
            day:"numeric",
            month:"long"
        };
        
        let day=today.toLocaleDateString("en-US",options);*/
    Item.find({}).then(function(item){
            
        if (item.length===0){
                //insert many 
            Item.insertMany(defaultItems)
                .then(function(){
                      console.log("successfully saved the items into DB");
                })
                .catch(function(err){
                      console.log(err);
                });
                res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems : item});
           //mongoose.connection.close();
           //console.log("not added");
        }

    }).catch(function(err){
        console.log(err);
    });

    
});

app.post("/",function(req,res){
    console.log(req.body);

    const itemName =req.body.newItem;
    const listName=req.body.list;

    const item =new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");   
    }else{
        List.findOne({name: listName}).then(function(foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
});

app.post("/delete",function(req,res){
    const checkedItemID =req.body.checkbox;
    const listName=req.body.listName;
    //findbyidandremove on mongoose docn

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemID)
            .then(function () {
                console.log("Successfully removed");
            })
        .catch(function (err) {
                console.log(err);
            });
            res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}})
        .then(function (foundList) {
            console.log("Successfully removed from the list");
            res.redirect("/"+listName);
        })
        .catch(function (err) {
            console.log(err);
        });
    }

});

//adding dynamic list by express route parameters
app.get("/:customListName",function(req,res) {
    const customListName =_.capitalize(req.params.customListName); 
    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList) {
            //create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save();
            res.redirect("/"+customListName)
        }
        else{
            //show an existing list
            //db.list.drop();
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        }
        
    }).catch(function(error){
        console.log(error)     
    }); 
   
});


app.get("/about",function(req,res){
    res.render("about");
});


app.listen(3000,function(){
    console.log("Server is running on port 3000");
});