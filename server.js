require("dotenv").config();

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))

// Set up Mongo DB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dbName = "fcc-exercisetracker";
const url = process.env.SRVADDRESS;
const client = new MongoClient(url);

const findDocuments = function(db, query, callback) {
  // Get the documents collection
  const collection = db.collection('workouts');
  
  // Find some documents
  collection.find(query).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
}

const addWorkout = (db, user, workout, calback) => {
  const collection = db.colletion('workouts')
  client.connect((err) => {
    //find and modify here
  })
}

//GET INDEX PAGE
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
    
    client.connect((err) => {
      assert.equal(null, err);
      console.log("Connected correctly to server");
  
      const db = client.db(dbName);
      const query = {}; //finds all
     
      findDocuments(db, query, function(data) {
        console.log(data);
      })
    })
   
  });
  
  // CREATE NEW USER
  app.post("/api/exercise/new-user", (req, res) => {
    const newUser = (newUser) => {
      return {
        username: newUser,
        workouts: []
      }
    }

    const db = client.db(dbName);

    const createNewUser = (username, callback) => {
      client.connect((err) => {
        assert.equal(null, err);
  
        db.collection('workouts').insertOne(newUser(username), (err, res) => {
          assert.equal(null, err);
          assert.equal(1, res.insertedCount);
        })
        client.close();
        callback();
      })
    }

    createNewUser(req.body.username, () => {
      client.connect((err) => {
        findDocuments(db, {username: req.body.username}, (data) => {
          res.send(data);
        })
        client.close();
      })
    })
  })

  //GET ALL USERS
  app.get('/api/exercise/users', (req, res) => {
    client.connect(() => {
      const db = client.db(dbName);
      findDocuments(db, {}, (data) => {
        res.send(data);
      })
    })
  })

  //ADD EXERCISES
  app.post('/api/exercise/add', (req, res) => {
    const today = new Date();
    const workoutDate = req.body.date ? req.body.date : today;
    
    const newWorkout = {
      description: req.body.description,
      duration: req.body.duration,
      date: workoutDate
    }

    client.connect(() => {
      const db = client.db(dbName);
      db.collection('workouts').updateOne({_id: req.body.userId}, { $push: { workouts: newWorkout } }, () => {
        res.send(`updated user:${req.body.userId}`);
      })
      
      client.close();
    })
  })

  
  ////////////////////////////////////////////////////////////////////////////////////////////////
  /////////// STUFF FROM GLITCH //////////////////////////////////////////////////////////////////
  
  // Not found middleware
  app.use((req, res, next) => {
    return next({status: 404, message: 'not found'})
  })
  
  // Error Handling middleware
  app.use((err, req, res, next) => {
    let errCode, errMessage
  
    if (err.errors) {
      // mongoose validation error
      errCode = 400 // bad request
      const keys = Object.keys(err.errors)
      // report the first validation error
      errMessage = err.errors[keys[0]].message
    } else {
      // generic or custom error
      errCode = err.status || 500
      errMessage = err.message || 'Internal Server Error'
    }
    res.status(errCode).type('txt')
      .send(errMessage)
  })
  
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })
  