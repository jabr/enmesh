addToClasspath('hazelcast-1.9.3.1.jar');

exports.Hazelcast = {
    load: function() {
        console.info('Starting hazelcast...');
        
        java.lang.System.setProperty("hazelcast.logging.type", "none");
        
        var options = require.main.exports.options;
        var configFile = options.config || getResource('hazelcast.xml');
        var config = new com.hazelcast.config.FileSystemXmlConfig(configFile);
        
        if (options.mode != 'full') config.setSuperClient(true);
        
        var engine = this.engine = com.hazelcast.core.Hazelcast;
        engine.init(config);
        
        this.partitionService = engine.getPartitionService();
        this.cluster = engine.getCluster();
        
        this.members = function() this.cluster.getMembers();
        this.map = function(name) engine.getMap(name);
        this.queue = function(name) engine.getQueue(name);
        this.topic = function(name) engine.getTopic(name);
        
        this.node = engine.getDefaultInstance().getFactory().node;
        this.events = require('hazelcast/events');
        
        this.load = function() {};
        
        var clusterSize = this.members().size();
        console.info('Complete. ' + clusterSize + ' node(s) in cluster.');
    }
}
