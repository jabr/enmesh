console.info('Starting hazelcast...');

java.lang.System.setProperty("hazelcast.logging.type", "none");
addToClasspath('hazelcast-1.9.3.1.jar');

var core = com.hazelcast.core.Hazelcast;
var options = require.main.exports.options;
var config = new com.hazelcast.config.FileSystemXmlConfig(options.config || getResource('hazelcast.xml'));

if (options.mode != 'full') config.setSuperClient(true);

core.init(config);
exports.Hazelcast = {
    engine: core,
    execute: function(type, callback) {
        var task = com.hazelcast.core.DistributedTask(new type());
        task.setExecutionCallback(new com.hazelcast.core.ExecutionCallback({ done: callback }));
        core.getExecutorService().execute(task);
    }
};

console.info('Complete. ' + core.getCluster().getMembers().size() + ' node(s) in cluster.');
