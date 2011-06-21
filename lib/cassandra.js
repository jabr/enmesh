addToClasspath('libthrift-0.6.1.jar');
addToClasspath('cassandra-thrift-0.8.0.jar');

var node = 'localhost';
var port = 9160;

var client = {};
exports.Cassandra = {
    load: function () {
        client.sync = new Packages.priam.SyncClient(new Packages.priam.SyncConnection(node, port));
        client.async = new Packages.priam.AsyncClient(new Packages.priam.AsyncConnection(node, port));
    },
    client: client
};
