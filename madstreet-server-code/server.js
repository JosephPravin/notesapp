
const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi'); // this module returns a class
const MongoClient = require('mongodb').MongoClient;

const app = express();
const dburl = "mongodb://localhost:27017/";
var notes = [];
app.use(express.json());    // enable parsing of JSON object - adding a piece of middleware - use the middleware in the request handling pipeline
app.use(bodyParser.urlencoded({extended: true}))    // for parsing the form request
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

MongoClient.connect(dburl, { useNewUrlParser: true },(err, db) => {
    if(err) console.log(err);
    else{
            const dbo = db.db('mynotes');
            dbo.collection("notes").find().toArray(function(err, result) {
                if (err) {
                    throw err;
                }
                else {
                    notes = result;
                    console.log(result);
                } 
            });
            db.close();
        }    
    });

function validateNote(note){
    const schema = {
        title: Joi.string().min(3).max(30).required(),
        value: Joi.string().min(2),
        extra: Joi.string(),
        priority: Joi.boolean()
    }
    return Joi.validate(note, schema); 
}

app.get('/', (req, res) => {
    console.log(res);
    res.send("Hello world!"); 
});

app.get('/api/notes', (req, res) => {

    MongoClient.connect(dburl, { useNewUrlParser: true },(err, db) => {
    if(err) console.log(err);
    else{
            const dbo = db.db('mynotes');
            dbo.collection("notes").find().toArray(function(err, result) {
                if (err) {
                    throw err;
                }
                else {
                    notes = result;
                    console.log(result);
                } 
            });
            db.close();
        }    
    });

    res.send(notes);
});

app.post('/api/notes', (req, res) => {
    const result = validateNote(req.body);
    if(result.error){
        return res.status(400).send(result.error.details[0].message);
    }
    //notes.push(req.body);
    let note ={
                no: notes.length + 1,
                title: req.body.title,
                value: req.body.value,
                extra: req.body.extra,
                priority: req.body.priority
            };
    MongoClient.connect(dburl, { useNewUrlParser: true },(err, db) => {
        if(err) console.log(err);
        else{
            const dbo = db.db('mynotes');
            
            dbo.collection("notes").insertOne(note, function(err, result) {
                if (err) {
                    throw err;
                }
                else {
                    console.log("1 record inserted");
                } 
            });
            db.close();
        }    
    }); 

    res.send(note);
});

app.delete('/api/notes/:id', (req, res) => {
    console.log(parseInt(req.params.id));

    MongoClient.connect(dburl,{ useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mynotes");

        dbo.collection("notes").find().toArray(function(err, result) {
                if (err) {
                    throw err;
                }
                else {
                    notes = result;
                    console.log(result);
                } 
            });

        const note = notes.find( c => c.no === parseInt(req.params.id));
        if(!note) {
            return;
        }

        const myquery = { no: parseInt(req.params.id) };
        dbo.collection("notes").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(notes);
});

app.put('/api/notes/:id', (req, res) => {
    console.log(parseInt(req.params.id));

    MongoClient.connect(dburl, { useNewUrlParser: true },  function(err, db) {
        if (err) throw err;
        const dbo = db.db("mynotes");

        dbo.collection("notes").find().toArray(function(err, result) {
                if (err) {
                    throw err;
                }
                else {
                    notes = result;
                    console.log(result);
                } 
            });

        const note = notes.find( c => c.no === parseInt(req.params.id));
        if(!note) {
            return;
        }

        const myquery = { no: parseInt(req.params.id) };
        const newvalues = { $set: {title:  req.body.title, value:  req.body.value, extra: req.body.extra }  };
        dbo.collection("notes").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send("Updated");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}..`);
});