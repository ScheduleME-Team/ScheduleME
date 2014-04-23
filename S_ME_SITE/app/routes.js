// app/routes.js
var mongoose = require('mongoose');
//var JSON = require('JSON');
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
                    user : req.user, // get the user out of session and pass to template
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
				console.log(shift);
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
        console.log(newShifts);

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
};





// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
