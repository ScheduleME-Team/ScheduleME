/**
 * Created by Andrew on 4/20/2014.
 */
// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our employee model
var employeeSchema = mongoose.Schema({

    User_email  : String,
    firstname   : String,
    lastname    : String,
    email       : String,
    phone       : String
});

// methods ======================


// create the model for Employees and expose it to our app
module.exports = mongoose.model('Employee', employeeSchema);
