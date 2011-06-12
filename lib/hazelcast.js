addToClasspath('hazelcast-1.9.3.1.jar');

exports.Hazelcast = {
    engine: null,
    load: function() {
        console.info('Starting hazelcast...');
        
        java.lang.System.setProperty("hazelcast.logging.type", "none");
        
        var options = require.main.exports.options;
        var config = new com.hazelcast.config.FileSystemXmlConfig(options.config || getResource('hazelcast.xml'));
        
        if (options.mode != 'full') config.setSuperClient(true);
        
        var core = this.engine = com.hazelcast.core.Hazelcast;
        core.init(config);
        
        this.load = function() {};
        
        console.info('Complete. ' + core.getCluster().getMembers().size() + ' node(s) in cluster.');
    }
}
