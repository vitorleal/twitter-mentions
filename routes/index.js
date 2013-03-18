'use strict';

exports.index = function (req, res) {
  if (!req.session.oauthRequestToken) {
    res.render("index", {
      title: "Twitter App"
    });
  }
  else {
    res.redirect("/oauth");
  }
};
