addToClasspath('libthrift-0.6.1.jar');
addToClasspath('cassandra-thrift-0.8.0.jar');

var node = 'localhost';
var port = 9160;

exports.Cassandra = {
    connection: new Packages.priam.Connection(node, port)
};
