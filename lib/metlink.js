//
// Metlink, now PTV, is the public transport provider in Melbourne, Australia.
// They have seen fit to release an iPhone application that purports to be a
// "one-stop-shop for Victorian public transport information". Anybody who has
// used it knows otherwise. Luckily for us, however, there's a nifty API backing
// it up, and thanks to `metlinkapi` on reddit, it's not so hard to decipher.
//
// This library is an abstraction of that API.
//

//
// [request](http://github.com/mikeal/request) makes HTTP easy!
//
var request = require("request");

//
// The only thing exported is the Metlink function. This is the entry point to
// all the functionality of this module.
//
module.exports = Metlink;

//
// To start off, construct a new Metlink object.
//
// The `base_url` argument will almost always be
// `http://iphone.metlinkmelbourne.com.au/services`.
//
function Metlink(base_url) {
  if (!(this instanceof Metlink)) {
    return new Metlink(base_url);
  }

  this.base_url = base_url;
}

//
// Fetch a list of all available lines.
//
// Valid values for the `type` argument are:  
// * bus  
// * nightrider  
// * train  
// * tram  
// * vline  
//
// The callback provided is called in typical node style with the first argument
// being an `Error` object if an error occurred, or `null` if not. The second
// argument is an array of "lines". Each line will have a `line_name` property,
// which is a string, and a `suburbs` property, which is an array of strings.
//
Metlink.prototype.get_transport_line_list = Metlink.prototype.getTransportLineList = function(type, done) {
  request(this.base_url + "/getTransportLineList.php?transportType=" + type, function(err, xhr, data) {
    if (err) {
      return done(err);
    } else if (xhr.statusCode !== 200) {
      return done(Error("request failed"));
    } else {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return done(Error("invalid json returned"));
      }

      return done(null, data.data.map(function(e) {
        e.suburbs = e.suburbs.split("/");
        return e;
      }));
    }
  });
};
