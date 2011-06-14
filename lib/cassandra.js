addToClasspath('libthrift-0.6.1.jar');
addToClasspath('cassandra-thrift-0.8.0.jar');

var node = 'localhost';
var port = 9160;

exports.Cassandra = {
    client: {
        sync: new Packages.priam.SyncClient(new Packages.priam.SyncConnection(node, port)),
        async: new Packages.priam.AsyncClient(new Packages.priam.AsyncConnection(node, port))
    }
};
