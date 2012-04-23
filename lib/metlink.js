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
// We're using [request](http://github.com/mikeal/request) for HTTP requests,
// and node's built-in querystring for building query strings (surprise!). This
// should also work in [browserify](http://github.com/substack/node-browserify).
//
var request = require("request"),
    qs = require("querystring");

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
  var args = qs.stringify({
    transportType: type,
  });

  request(this.base_url + "/getTransportLineList.php?" + args, function(err, xhr, data) {
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

//
// Fetch a list of stops from a given line.
//
// The `line` argument is the `line_name` of a line returned from the previous
// method.
//
// The `type` argument is the same as for `getTransportLineList`.
//
// The callback is called with the first argument being either an `Error` object
// or null on error or success. Upon success, the second argument will be an
// array of objects. Each of these objects will have the following members:
// `location_name`, `suburb`, `key_id` and `location_id`. All except `key_id`
// are self-explanatory.
//
Metlink.prototype.get_stop_list_from_transport_line = Metlink.prototype.getStopListFromTransportLine = function(type, line, done) {
  var args = qs.stringify({
    transportType: type,
    transportLine: line,
  });

  request(this.base_url + "/getStopListFromTransportLine.php?" + args, function(err, xhr, data) {
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
        e.location_name = e.location_name.trim();

        return e;
      }));
    }
  });
};

//
// Fetch a list of stops based on proximity to a certain location.
//
// The `latitude` and `longitude` are regular old decimal representations of
// coordinates.
//
// The `types` argument is a list of transport types. See `getTransportLineList`
// for a description of valid types.
//
// The callback is called with the first argument being either an `Error` object
// or null on error or success. Upon success, the second argument will be an
// array of objects. Each of these objects will have the following members:
// `type`, `location_name`, `suburb`, `key_id` and `location_id`, `latitude`,
// `longitude`, `lines` and `distance`. `lines` will be an array of strings.
//
Metlink.prototype.get_closest_stops_from_location = Metlink.prototype.getClosestStopsFromLocation = function(latitude, longitude, types, done) {
  if (!(typeof types === "object" && types instanceof Array)) {
    types = [types];
  }

  var args = qs.stringify({
    currLat: latitude,
    currLon: longitude,
    transportTypes: types.join(","),
  });

  request(this.base_url + "/getClosestStopsFromLocation.php?" + args, function(err, xhr, data) {
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
        e.location_name = e.location_name.trim();
        e.lines = e.lines.split("/");

        return e;
      }));
    }
  });
};

//
// Fetch the directions that trains are running their lines for a location id
//
// The `location_id` argument is a `location_id` property of a location returned
// by one of the above methods.
//
// The `type` argument is a transport type. See `getTransportLineList` for a
// description of valid types.
//
// The callback is called with the first argument being either an `Error` object
// or null on error or success. Upon success, the second argument will be an
// array of strings. These strings are the "directions" that the vehicles are
// traveling in.
//
Metlink.prototype.get_directions_for_location_id = Metlink.prototype.getDirectionsForLocationId = function(location_id, type, done) {
  var args = qs.stringify({
    locationID: location_id,
    transportType: type,
  });

  request(this.base_url + "/getDirectionsForLocationId.php?" + args, function(err, xhr, data) {
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
        return e.direction_name.trim();
      }));
    }
  });
};

//
// Fetch information about a stop (location) based on its ID
//
// The `location_id` argument is a `location_id` property of a location returned
// by one of the above methods.
//
// The `type` argument is a transport type. See `getTransportLineList` for a
// description of valid types.
//
// The callback is called with the first argument being either an `Error` object
// or null on error or success. Upon success, the second argument will be an
// object with the following properties: `location_name`, `location_id`,
// `latitude`, `longitude`, `suburb`, `lines` and `key_id`. All properties are
// strings, except `lines` which is an array of strings.
//
Metlink.prototype.get_stop_with_identifier = Metlink.prototype.getStopWithIdentifier = function(location_id, type, done) {
  var args = qs.stringify({
    locationID: location_id,
    transportType: type,
  });

  request(this.base_url + "/getStopWithIdentifier.php?" + args, function(err, xhr, data) {
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

      data.data.location_name = data.data.location_name.trim();
      data.data.lines = data.data.lines.split("/");

      return done(null, data.data);
    }
  });
};
