module.exports = {

    'facebookAuth' : {
        'clientID' 		: 'your-secret-clientID-here', // your App ID
        'clientSecret' 	: 'your-client-secret-here', // your App Secret
        'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey' 		: 'your-consumer-key-here',
        'consumerSecret' 	: 'your-client-secret-here',
        'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID' 		: '750618144041.apps.googleusercontent.com',
        'clientSecret' 	: 'HxlMh4cqxN4jZclEqNf4lpoh',
        'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
    }

};
