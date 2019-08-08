const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Task = require('./models/task');
const User = require('./models/user');
const Token = require('./models/token');

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser());

mongoose.connect('mongodb://localhost:27017/tasks');

const connection = mongoose.connection;

connection.once('open' , () => {
    console.log("MongoDb database connection successful");
});



//Returning the tasks from the database
router.route('/tasks').get((req,res) => {
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        Task.find({$and:[{complete: false},{taskOwnerId: result[0].userId}]})
        .then(task => {
            res.status(200).json(task);
        }).catch(err => {
            res.status(400).json({msg: err});
        });
    })
    .catch(err => {
        res.status(400).json({msg: err});
    });
});

//Return the tasks which are done from the database
router.route('/tasksDone').get((req,res) => {
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        Task.find({$and:[{complete: true},{taskOwnerId: result[0].userId}]})
        .then(task => {
            res.status(200).json(task);
        }).catch(err => {
            res.status(400).json({msg: err});
        });
    })
    .catch(err => {
        res.status(400).json({msg: err});
    });
});

//Return a task from the database with id given
router.route('/tasks/:id').get((req , res) => { 
    //Look for the task in the database if it exist with given id and complete field is false
    Task.find(
        {$and:[{id: req.params.id}, {complete: false}]} , (err , task) => {
        //Return err to console if not found
        if(err){
            res.status(400).json({msg: err});
        }
        //Return the task as Json
        else{
            res.status(200).json(task);
        }
    });
});

//Return a task that is done from the database with id given
router.route('/tasksDone/:id').get((req , res) => { 
    //Look for the task in the database if it exist with given id and complete field is true
    Task.findById({$and:[{id: req.params.id}, {complete: true}]} , (err , task) => {
        //Return err to console if not found
        if(err){
            res.status(400).json({msg: err});
        }
        //Return the task as Json
        else{
            res.status(200).json(task);
        }
    });
});

//Add a new task to the tasks database
router.route('/tasks/add').post(verify,(req , res) => {
    //Build a new task with the data from the body 
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        const temp = {
            task: req.body.task,
            complete: req.body.complete,
            taskOwnerId: result[0].userId,
            url: req.body.url
        }
        let task = new Task(temp);
        task.save().then(task => {
            res.status(200).json(task._id);
        }).catch(err => {
            res.status(400).json({msg:'Failed to create new record.'});
        });
    })
    .catch(err => {
        res.status(401).json(({msg: err}));
    });
});


//Update a task from the tasks database given an id
router.route('/tasks/update/:id').post((req , res) => { 
    //Look for the task in our database
    var updatedTask = {
        _id: req.body._id,
        task: req.body.task,
        complete: req.body.complete
    }
    Task.updateOne({_id: req.body._id}, {$set: updatedTask} ,(err , task) => {
        if(err){
            res.status(400).json({msg: err});
        }
        //Return the task as Json
        else{
            res.status(200).json(task);
        }
    })
});

//Delete a task from tasks database given an id
router.route('/tasks/delete/:id').get((req , res) => { 
    //Look for the task in our database and remove it by id
    Task.remove({_id: req.params.id} , (err,task) => {
        if(err){
            res.status(400).json(({msg: err}));
        }
        else{
            res.status(200).json({msg: 'Remove successfuly'});
        }
    });
});

//Create a new user given an email and a password
//The password is not saved as sent by goes throught hash function
router.post('/signup' , (req , res) => {
    //Look if the email is already in our database (we dont let the same email to create two users)
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        //Email is found in our database
        if(user.length >= 1){
            return res.status(409).json({msg: 'Mail already exist'});
        }
        //We proceed 
        else{
            //We encrypt the given password to store its hash in our database (the 10 is to make it safer due to hash tables online)
            bcrypt.hash(req.body.password, 10 ,(err , hash) => {
                if(err){
                    return res.status(500).json({
                        msg: err
                    });
                }
                //Save the user email and hash password in our database
                else{
                    const user = new User({
                        email: req.body.email,
                        password: hash
                    });
                    user
                    .save()
                    .then(result => {
                        res.status(200).json({msg: 'User created'})
                    })
                    .catch( err => {
                        res.status(400).json(({msg: err}));
                    });
                }
            })

        }
    })
    .catch(err => {
        res.status(400).json({msg: err});
    });
    
});

//Sign in a user
//Check if email exist in our database
//Check if the password match the email in our database
router.post("/signin" , (req,res) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        //Email is not found in our database
        if(user.length < 1){
            return res.status(401).json({msg: 'User exists'});
        }
        else{
            bcrypt.compare(req.body.password , user[0].password, (err , result) => {
                if(err){
                    res.status(401).json({msg: 'Auth failed'});
                }
                else if(result){
                    const token = jwt.sign(user[0].email , 'server');
                    res.header('auth-token',token);
                    res.status(200).json({
                        email: req.body.email,
                        token: token,
                        _id: user[0]._id});
                }
                else{
                    res.status(401).json({msg: 'Auth failed'});
                }
            })
        }
    })
    .catch(err => {
        res.status(400).json(({msg: err}));
    });
});

router.post("/token" , (req , res) => {
    Token.find({token : req.body.token}).exec()
    .then((result) => {
        if(result.length < 1){
            let tokenToStore = new Token(req.body)
            tokenToStore
            .save()
            .then(result => {
                res.status(200).json({msg: result})
            })
            .catch( err => {
                res.status(400).json(({msg: err}));
        });
        }
    })
    .catch(err => {
        res.status(400).json(({msg: err}));
    });
    
})

app.use('/' , router);
app.get('/',(req , res) => {
    res.status(200).send({msg: 'Hello World!'});
});
app.listen(4100 , () => console.log('Express server running on port 4100'));

function verify(req , res , next){
    try{
        const token = req.header('auth-token');
        if(!token){
            res.status(400).json({msg: 'no token'});;
        }
        else{
            const decoded = jwt.verify(token, 'server');
            req.useData = decoded;
            next();
        }
    }catch(error){
        return res.status(401).json({
            msg: 'Ivalid token'
        });
    }
}

