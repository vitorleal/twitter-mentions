'use strict';

var oAuth = require('oauth'),
  //basic config
  config = {
    //the key and secret should not be visible here, but is just to demonstrate the app
    consumerKey    : "98lnhe1lmRpkyaSCt9rDDg",
    consumerSecret : "yzPGCmQxYvDVe9U475oVhXl7aYE4qaEUXHpkyBXTK8",
    callbackUrl    : "http://localhost:3000/callback",
    authorizeUrl   : "https://twitter.com/oauth/authorize?oauth_token=",
    credentialsUrl : "https://api.twitter.com/1/account/verify_credentials.json",
    mentionsUrl    : "https://api.twitter.com/1.1/statuses/mentions_timeline.json?count=200"
  };

//Authenticate the user in the /oauth route
exports.connect = function (req, res) {
  authenticate().getOAuthRequestToken(function (err, oauthToken, oauthSecret, results) {
    //keep the oauthToken and secret in the session
    req.session.oauthToken  = oauthToken;
    req.session.oauthSecret = oauthSecret;

    //redirect to the oauth autorize with the request token
    res.redirect(config.authorizeUrl + req.session.oauthToken);
  });
};

//The /calback route to deal with the data
exports.callback = function (req, res) {
  authenticate().getOAuthAccessToken(req.session.oauthToken, req.session.oauthSecret, req.query.oauth_verifier,
  function (err, token, tokenSecret, results) {
    if (err) {
      res.send("Error getting access token");

    } else {
      req.session.token       = token;
      req.session.tokenSecret = tokenSecret;

      //get the users credentials
      authenticate().get(config.credentialsUrl, req.session.token, req.session.tokenSecret,
      function (err, data, response) {
        if (err) {
          res.send("Error getting credentials");
        } else {
          //keep the user data in the session
          req.session.user = JSON.parse(data);

          //get the user mentions
          authenticate().get(config.mentionsUrl, req.session.token, req.session.tokenSecret,
          function (err, data, response) {
            if (err) {
              res.send("Error getting the mentions");

            } else {
              console.log(data.length);
              res.render("app", {
                user: req.session.user,
                mentions: data,
                total: JSON.parse(data).length
              });
            }
          });
        }
      });

    }
  });
};


//function to deal with the oAuth
function authenticate() {
  return new oAuth.OAuth(
    "https://twitter.com/oauth/request_token",
    "https://twitter.com/oauth/access_token",
    config.consumerKey,
    config.consumerSecret,
    "1.0A", null, "HMAC-SHA1"
  );
}
