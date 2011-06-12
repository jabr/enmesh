function watcher(loggers) {
    return function() {
        var f = this.watch;
        if (!f.listener) {
            f.listener = this.listen(loggers);
            f.listener.unlisten = f.listener.remove;
            f.listener.remove = function() {
                f.listener.unlisten();
                f.listener = null;
            };
        }
        return f.listener;
    }
}

exports.membership = {
    listen: function(handlers) {
        var cluster = com.hazelcast.core.Hazelcast.getCluster();
        
        var listener = new com.hazelcast.core.MembershipListener({
            memberAdded: handlers.added || function() {},
            memberRemoved: handlers.removed || function() {}
        });
        
        cluster.addMembershipListener(listener);
        
        listener.remove = function() {
            cluster.removeMembershipListener(this);
        };
        
        return listener;
    },
    
    watch: watcher({
        added: function(e) console.info(e),
        removed: function(e) console.info(e)
    })
};

exports.migration = {
    listen: function(handlers) {
        var partitionService = com.hazelcast.core.Hazelcast.getPartitionService();
        
        var listener = new com.hazelcast.partition.MigrationListener({
            migrationStarted: handlers.started || function() {},
            migrationCompleted: handlers.completed || function() {}
        });
        
        partitionService.addMigrationListener(listener);
        
        listener.remove = function() {
            partitionService.removeMigrationListener(this);
        };
        
        return listener;
    },
    
    watch: watcher({
        started: function(e) console.info(e),
        completed: function(e) console.info(e)
    })
};

exports.lifecycle = {
    listen: function(handlers) {
        var lifecycleService = com.hazelcast.core.Hazelcast.getLifecycleService();
        
        var listener = new com.hazelcast.core.LifecycleListener({
            stateChanged: handlers.changed || function() {}
        });
        
        lifecycleService.addLifecycleListener(listener);
        
        listener.remove = function() {
            lifecycleService.removeLifecycleListener(this);
        };
        
        return listener;
    },
    
    watch: watcher({
        changed: function(e) console.info(e)
    })
};
