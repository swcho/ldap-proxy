
var ldap = require('ldapjs');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json').toString());

var server = ldap.createServer();
var client = ldap.createClient({
    url: config.server.url
});

server.bind(config.bindDN, function(req, res, next) {
    //var id = req.id.toString();
    //var dn = req.dn.toString();
    //var pw = req.credentials;
    //console.log(req);
    //console.log('id: ' + id);
    //console.log('bind DN: ' + dn);
    //console.log('bind PW: ' + pw);
    res.end();
});

server.search(config.searhBase, function(req, res, next) {

    //console.log(req);
    //console.log('type: ' + req.type);
    //console.log('json: ' + JSON.stringify(req.json, null, 2));

    var id = req.id.toString();
    var base = req.dn.toString();
    var filter = req.filter.toString();
    var scope = req.scope.toString();

    //console.log('id: ' + id);
    //console.log('base: ' + base);
    //console.log('filter: ' + filter);
    //console.log('scope: ' + scope);
    var opts = {
        filter: filter,
        scope: scope
    };

    client.search(base, opts, function(err, search) {
        //assert.ifError(err);

        search.on('searchEntry', function(entry) {
            //console.log('entry: ' + JSON.stringify(entry.object, null, 2));
            //console.log(entry.object);
            //var obj = {
            //    dn: entry.dn.toString(),
            //    attributes: []
            //};
            //entry.attributes.forEach(function (a) {
            //    obj.attributes.push(a.json || a);
            //});
            entry.messageID = res.messageID;
            res.send(entry);
        });
        search.on('searchReference', function(referral) {
            console.log('referral: ' + referral.uris.join());
        });
        search.on('error', function(err) {
            console.error('error: ' + err.message);
            res.error(err);
        });
        search.on('end', function(result) {
            console.log('status: ' + result.status);
            res.end();
        });
    });
});

server.listen(1389, function() {
    console.log('LDAP server listening at %s', server.url);
    client.bind(config.server.bindDN, config.server.bindPW, function(err) {
        if (err) {
            console.log('client bind error: ' + err);
        } else {
            console.log('client bind successful');
        }
    });
});
