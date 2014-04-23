// app/routes.js
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var async = require('async');


//
//
// DEFINE SCHEMAS
//
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
var Employee = mongoose.model('Employee', employeeSchema);

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
    shiftEndIndex    : Number

});

// methods ======================
// generating a hash

// create the model for shift and expose it to our app
var Shift = mongoose.model('Shift', shiftSchema);

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});


	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('index.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/calendar', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('index.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/calendar', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/calendar', isLoggedIn, function(req, res) {
                res.render('calendar.ejs', {
                    user : req.user // get the user out of session and pass to template
                });
	});
	
	app.get('/getEmployees', isLoggedIn, function(req, res) {
		Employee.find({ "User_email": req.user.google.email }, function(err, employee) {
			if(!err) {
				res.json(200, employee);
			}
			else
				console.log(err);
			});
	});
	
	app.get('/getShifts', isLoggedIn, function(req, res) {
		Shift.find({ "User_email": req.user.google.email }, function(err, shift) {
			if(!err) {
				res.json(200, shift);
				//console.log(shift);
			}
			else
				console.log(err);
		});
	});

    app.post('/addEmployee', isLoggedIn, function(req, res) {

        var newEmployee = req.body;

        var employee = new Employee();


        employee.User_email = newEmployee.User_email;
        employee.firstname   = newEmployee.firstName;
        employee.lastname    = newEmployee.lastName;
        employee.email    =    newEmployee.email;
        employee.phone    =    newEmployee.phoneNumber;

        employee.save(function(err) {
            if (err)
                throw err;
            //return done(null, employee);
        });
        
        res.send(200);
    });

    app.post('/saveShifts', isLoggedIn, function(req, res) {

        var newShifts = req.body;
        //console.log(newShifts);

        for(var i = 0; i<newShifts.length; i++){

            var shift = new Shift();
            shift.employee_email = newShifts[i].employee.email;
            shift.User_email = newShifts[i].employee.User_email;
            shift.date._day = newShifts[i].day;
            shift.date.year = newShifts[i].year;
            shift.date.month = newShifts[i].month;
            shift.start_time = newShifts[i].startTime;
            shift.end_time = newShifts[i].endTime;
            shift.shiftStartIndex = newShifts[i].startIndex;
            shift.shiftEndIndex = newShifts[i].endIndex;

            shift.save(function(err) {
                if (err)
                    throw err;
                //return done(null, employee);
            });
            
            res.send(200);
        }
    });

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/calendar',
                failureRedirect : '/'
            }));

    // =====================================
    // SEND EMAILS =======================
    // =====================================



    app.post('/sendShifts', isLoggedIn, function(req, res) {
        var requestObject= req.body;



        var startDate = new Date();
            startDate.setDate(requestObject.startDay);
            startDate.setMonth(requestObject.startMonth);
            startDate.setFullYear(requestObject.startYear);

        var endDate = new Date();
            endDate.setDate(requestObject.endDay);
            endDate.setMonth(requestObject.endMonth);
            endDate.setFullYear(requestObject.endYear);

        var schedule = {};// object 1
        var dates = [];
        while(startDate.getDate() <= endDate.getDate() || startDate.getMonth() != endDate.getMonth() || startDate.getFullYear() != endDate.getFullYear()){

            var tempDate = new Date();
                tempDate.setDate(startDate.getDate());
                tempDate.setMonth(startDate.getMonth());
                tempDate.setFullYear(startDate.getFullYear());
            dates.push(tempDate);
            startDate.setDate(startDate.getDate() +1);
        }

        // 1st parameter in async.each() is the array of items
        async.each(dates,
            // 2nd parameter is the function that each item is passed into
            function(currDate, callback){
                // Call an asynchronous function (often a save() to MongoDB)
                Shift.find({"User_email": req.user.google.email, "date._day":currDate.getDate(), "date.month":currDate.getMonth(), "date.year":currDate.getFullYear()}, function(err, shiftArray) {
                    callback();
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("...........NEW DAY..........");
                        for (var i = 0; i < shiftArray.length; i++) {
                            console.log(shiftArray[i].employee_email + " Has a shift today");
                            var tempShift = {};// object 2

                            tempShift.employee_email = shiftArray[i].employee_email;
                            tempShift.User_email = shiftArray[i].User_email;
                            tempShift._day = shiftArray[i].date._day;
                            tempShift.month = shiftArray[i].date.month;
                            tempShift.year = shiftArray[i].date.year;
                            tempShift.start_time = shiftArray[i].start_time;
                            tempShift.end_time = shiftArray[i].end_time;
                            tempShift.shiftStartIndex = shiftArray[i].shiftEndIndex;
                            tempShift.shiftEndIndex = shiftArray[i].shiftEndIndex;
                            var shiftText ="";
                            shiftText += tempShift.month + "/" + tempShift._day + "/" + tempShift.year + "\n";
                            shiftText += "\t" + tempShift.start_time + " to " + tempShift.end_time + "\n\n";
                            if(schedule[shiftArray[i].employee_email] == null)
                                schedule[shiftArray[i].employee_email] = "";
                            schedule[shiftArray[i].employee_email]+=(shiftText);
                        }
                    }
                });
            },
            // 3rd parameter is the function call when everything is done
            function(err){
                if(err){
                    console.log(err);

                }
                else{
                    // create reusable transport method (opens pool of SMTP connections)
                    var smtpTransport = nodemailer.createTransport("SMTP", {
                        service: "Gmail",
                        auth:{

                            user: "schedulemeapplication@gmail.com",
                            pass: "Jordan360Andrew"

//                XOAuth2: {
//                    user: req.user.google.email,
//                    clientId: req.user.google.id,
//                    clientSecret: req.user.google.secret,
//                    refreshToken: req.user.google.refresh,
//                    accessToken: req.user.google.token,
//                    timeout: 3600
//                }
                        }
                    });

                    for(key in schedule) {
                        if (schedule.hasOwnProperty(key)) {
                            var bodyText = req.user.google.name + " Scheduled you for:\n\n";
                            bodyText +=schedule[key];

                            // setup e-mail data with unicode symbols
                            var mailOptions = {
                                from: req.user.google.email, // sender address
                                to: "schedulemeapplication@gmail.com", // list of receivers ************************************CHANGE ME BACK TO KEY!!!!!!!!!!!**********************************88
                                subject: "Your ScheduleME from: " + requestObject.startMonth + "/" + requestObject.startDay + "/" + requestObject.startYear +
                                    "to: " + requestObject.endMonth + "/" + requestObject.endDay + "/" + requestObject.endYear, // Subject line
                                text: bodyText // plaintext body
                            }

                            // send mail with defined transport object
                            smtpTransport.sendMail(mailOptions, function (error, response) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log("Message sent: " + response.message);
                                }
                            });
                        }
                    }
                    smtpTransport.close(); // shut down the connection pool, no more messages
                    res.send(200);
                }
            }
        );
    });
};





// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
