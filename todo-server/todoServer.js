const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const session = require('express-session');

const Task = require('./models/task');
const User = require('./models/user');
const Token = require('./models/token');

const app = express();
const router = express.Router();

app.use(cors());
app.use(session({
    saveUnitialized: false,
    secret: 'server',
    cookie:{
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true, // might check it 
        resave: false
    }
}))
app.use(bodyParser());
app.get('/',(req , res) => {
    res.status(200).send({msg: 'Hello World!'});
});
app.listen(4100 , () => console.log('Express server running on port 4100'));
app.use('/' , router);


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
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            Task.find({$and:[{complete: false},{taskOwnerId: result[0].userId}]})
            .then(task => {
                res.status(200).json(task);
            }).catch(err => {
                res.status(400).json({msg: err});
            });
        }
    })
    .catch(err => {
        res.status(401).json({msg: err});
    });
});

//Return the tasks which are done from the database
router.route('/tasksDone').get((req,res) => {
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            Task.find({$and:[{complete: true},{taskOwnerId: result[0].userId}]})
            .then(task => {
                res.status(200).json(task);
            }).catch(err => {
                res.status(400).json({msg: err});
            });
        }
    })
    .catch(err => {
        res.status(401).json({msg: err});
    });
});

//Add a new task to the tasks database
router.route('/tasks/add').post((req , res) => {
    //Build a new task with the data from the body 
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            const temp = {
                task: req.body.task,
                complete: req.body.complete,
                taskOwnerId: result[0].userId,
                url: req.body.url,
                createdTime: req.body.createdTime,
                updatedTime: req.body.updatedTime
            }
            let task = new Task(temp);
            task.save().then(task => {
                res.status(200).json(task._id);
            }).catch(err => {
                res.status(400).json({msg:'Failed to create new record.'});
            });
        }
    })
    .catch(err => {
        res.status(401).json(({msg: err}));
    });
});


//Update a task from the tasks database given an id
router.route('/tasks/update/:id').post((req , res) => { 
    const token = req.header('auth-token');
    
    Token.find({token: token}).exec()
    .then((result) => {
    //Look for the task in our database
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            
            var updatedTask = {
                _id: req.body._id,
                task: req.body.task,
                complete: req.body.complete,
                updatedTime: req.body.updatedTime
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
        }
    }).catch(err => {
        res.status(401).json(({msg: err}));
    });
});

//Delete a task from tasks database given an id
router.route('/tasks/delete/:id').post((req , res) => { 
    //Look for the task in our database and remove it by id
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            Task.remove({_id: req.params.id} , (err,task) => {
                if(err){
                    res.status(400).json(({msg: err}));
                }
                else{
                    res.status(200).json({msg: 'Remove successfuly'});
                }
            });
        }
    }).catch(err => {
        res.status(401).json(({msg: err}));
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
                        password: hash,
                        color: req.body.color
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
            return res.status(401).json({msg: 'User dosnt exists'});
        }
        else{
            bcrypt.compare(req.body.password , user[0].password, (err , result) => {
                if(err){
                    res.status(401).json({msg: 'Auth failed'});
                }
                else if(result){
                    //const token = jwt.sign(user[0].email , 'server');
                    const token = req.session.id;
                    res.header('auth-token',token);
                    res.status(200).json({
                        email: req.body.email,
                        token: token,
                        color: result.color,
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

//Register a token on login session 
router.post("/token" , (req , res) => {
    
    let tokenToStore = new Token(req.body)
    tokenToStore
    .save()
    .then(result => {
        res.status(200).json({msg: result})
    })
    .catch( err => {
        console.log(err)
        res.status(400).json(({msg: err}));
    });    
})

//Update the color field of a user
router.post("/color" , (req , res) => {
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            User.updateOne({_id: req.body.userId} , {$set: {color:req.body.color}} , (err , user) => {
                if(err){
                    res.status(400).json({msg: err});
                }
                //Return the task as Json
                else{
                    res.status(200).json({msg: user});
                }
            } )
        }
    }).catch(err => {
        res.status(401).json(({msg: err}));
    });
});

//Update the font field of a user
router.post("/font" , (req , res) => {
    const token = req.header('auth-token');
    Token.find({token: token}).exec()
    .then((result) => {
        if(result.length < 1){
            res.status(401).json(({msg: err}));
        }
        else{
            User.updateOne({_id: req.body.userId} , {$set: {font:req.body.font}} , (err , user) => {
                if(err){
                    res.status(400).json({msg: err});
                }
                //Return the task as Json
                else{
                    res.status(200).json({msg: user});
                }
            } )
        }
    }).catch(err => {
        res.status(401).json(({msg: err}));
    });
})

//Return a user given a token/cookie
router.post("/userByToken" , (req , res) => {
    Token.find({token : req.body.token}).exec()
    .then((result) => {
        if(result.length < 1){
            res.status(401).json({msg: "token dosn't exist"})
        }
        else{
            User.find({_id: result[0].userId}).exec()
            .then((user) => {
                res.status(200).json(user)
            }).catch(err => {
                res.status(400).json({msg: err})
            })
        }
    }).catch(err => {
        res.status(401).json({msg: err})
    })
})


