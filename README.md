Metlink
=======

Remember Metlink? Well it's back! In JS form!

Overview
--------

Metlink, now PTV, is the public transport provider in Melbourne, Australia.
They have seen fit to release an iPhone application that purports to be a
"one-stop-shop for Victorian public transport information". Anybody who has
used it knows otherwise. Luckily for us, however, there's a nifty API backing
it up, and thanks to `metlinkapi` on reddit, it's not so hard to decipher.

This library is an abstraction of that API.

Installation
------------

Really easy.

`$ npm install metlink`

Or if you want to live on the edge (of commandeering APIs)

`$ npm install https://github.com/deoxxa/metlink/tarball/master`

Documentation
-------------

Check out `docs/metlink.html`

Example Usage
-------------

```javascript
var Metlink = require("./lib/metlink");

var m = new Metlink("http://iphone.metlinkmelbourne.com.au/services");

m.get_transport_line_list("train", function(err, res) {
  console.log(res);

  m.get_stop_list_from_transport_line(type, res[0].line_name, function(err, res) {
    console.log(res);
  });
});
```

License
-------

BSD, 3 clause. A copy is included.

Contact
-------

* [github](http://github.com/deoxxa)
* [twitter](http://twitter.com/#!/deoxxa)
* [email](mailto:deoxxa@fknsrs.biz)
