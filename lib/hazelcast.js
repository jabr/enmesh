addToClasspath('hazelcast-1.9.3.1.jar');

exports.Hazelcast = {
    load: function() {
        console.info('Starting hazelcast...');
        
        java.lang.System.setProperty("hazelcast.logging.type", "none");
        
        var options = require.main.exports.options;
        var configFile = options.config || getResource('hazelcast.xml');
        var config = new com.hazelcast.config.FileSystemXmlConfig(configFile);
        
        if (options.mode != 'full') config.setSuperClient(true);
        
        this.engine = com.hazelcast.core.Hazelcast;
        this.engine.init(config);
        
        this.node = this.engine.getDefaultInstance().getFactory().node;
        this.events = require('hazelcast/events');
        
        this.load = function() {};
        
        var clusterSize = this.engine.getCluster().getMembers().size();
        console.info('Complete. ' + clusterSize + ' node(s) in cluster.');
    }
}
