/**
 * Created by Andrew on 4/20/2014.
 */
// app/models/shift.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our shift model
var shiftSchema = mongoose.Schema({

    employee_email   : String ,
    User_email       : String,
    date             :{
        year         : Number,
        month        : Number,
        _day         : Number
    },
    start_time       : String,
    end_time         : String,
    shiftStartIndex  : Number,
    shiftEndIndex  : Number

});

// methods ======================
// generating a hash

// create the model for shift and expose it to our app
module.exports = mongoose.model('Shift', shiftSchema);