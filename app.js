var express=require("express");
var app = express();
var bodyParser=require('body-parser');
var MongoClient = require('mongodb').MongoClient;


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname+'/views'));

var url = 'mongodb://bookmarks:bookmarks@ds045622.mongolab.com:45622/heroku_nzzz6bbh';
var db=undefined;
MongoClient.connect(url,function(err,database) {
	if(err){
	  console.log(err);
	}
	else{
		db=database;
	}
});



app.post("/editBookmark",function(req,res){
	
	var oldDetails=req.body.old;
	var editedDetails=req.body.edited;
	
	if(editedDetails.folderName==undefined||editedDetails.folderName==''||editedDetails.folderName==null)
		editedDetails.folderName=oldDetails.folderName;
		
	var collection = db.collection('directory');
		collection.update({folder:oldDetails.folderName,name:oldDetails.name,url:oldDetails.url}
		, { $set: {folder:editedDetails.folderName,name:editedDetails.name,url:editedDetails.url} }, function(err, result) {
		if(err){
			console.log(err);
		}
		else{
			formatAndSendData(req,res);
		}
  });
});

app.post("/createFolder",function(req,res){
	var folderName=req.body.folderName;
	var collection = db.collection('directory');
	collection.insert({folder:folderName,name:"",url:""},function(err,docs) {
		if(err){
			console.log(err);
		}
		else{
			formatAndSendData(req,res);
		}
	});
});

app.post("/deleteFolder",function(req,res){
	var folderName=req.body.folderName;
	var collection = db.collection('directory');
	collection.remove({folder:folderName},function(err,docs) {
		if(err){
			console.log(err);
		}
		else{
			formatAndSendData(req,res);
		}
	});
});

app.post("/createBookmark",function(req,res){
	var folderName=req.body.folderName;
	var name=req.body.name;
	var url=req.body.url;
	var collection = db.collection('directory');
	collection.insert({folder:folderName,name:name,url:url},function(err,docs) {
		if(err){
			console.log(err);
		}
		else{
			formatAndSendData(req,res);
		}
	});
});

app.post("/deleteBookmark",function(req,res){
	var folderName=req.body.folderName;
	var name=req.body.name;
	var collection = db.collection('directory');
	//remove
	collection.remove({folder:folderName,name:name},function(err,docs) {
		if(err){
			console.log(err);
		}
		else{
		//If all the bookmarks are deleted,corresponding folder will also be.
		//Add dummy
			collection.find({}).toArray(function(err,docs) {
				if(err){
				  console.log(err);
				}
				else if(docs.length==0){
					collection.insert({folder:folderName,name:'',url:''},function(err,docs) {
						if(err){
							console.log(err);
						}
						else{
							formatAndSendData(req,res);
						}
					});
				}
				else
				formatAndSendData(req,res);
			});
		}
	});
});

app.get("/init",function(req,res){
	formatAndSendData(req,res);
});

var formatAndSendData=function(req,res){
	var data={};
	var collection = db.collection('directory');
	collection.find({}).toArray(function(err,docs) {
	if(err){
	  console.log(err);
	}
	else{
		console.log(docs);
		docs.forEach(function(entry,id){
			console.log(entry);
			if(!data.hasOwnProperty(entry.folder))
				data[entry.folder]=[];
			if(entry.name!=""&&entry.url!="")
				data[entry.folder].push({"name":entry.name,"url":entry.url})
		});
	}
	sendData(res,data);
  });
}
var sendData=function(res,data){
	res.send(data);
}

app.listen(process.env.PORT||3000);