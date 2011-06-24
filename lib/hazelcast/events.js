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
        started: function(e) console.info('started ', e),
        completed: function(e) console.info('completed ', e)
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

exports.instances = {
    listen: function(handlers) {
        var service = com.hazelcast.core.Hazelcast;
        
        var listener = new com.hazelcast.core.InstanceListener({
            instanceCreated: handlers.created || function() {},
            instanceDestroyed: handlers.destroyed || function() {}
        });
        
        service.addInstanceListener(listener);
        
        listener.remove = function() {
            service.removeInstanceListener(this);
        };
        
        return listener;
    },
    
    watch: watcher({
        created: function(e) console.info('Instance created: ' + e),
        destroyed: function(e) console.info('Instance destroy: ' + e)
    })
};

function objectWatcher(loggers) {
    return function(object) {
        var f = this.watch;
        f.watchers = f.watchers || {};
        if (!f.watchers[object]) {
            f.watchers[object] = this.listen(object, loggers);
            f.watchers[object].unlisten = f.watchers[object].remove;
            f.watchers[object].remove = function() {
                f.watchers[object].unlisten();
                delete f.watchers[object];
            };
        }
        return f.watchers[object];
    }
}

exports.entries = {
    listen: function(map, handlers, options) {
        options = options || {};
        
        var listener = new com.hazelcast.core.EntryListener({
            entryAdded: handlers.added || function() {},
            entryRemoved: handlers.removed || function() {},
            entryUpdated: handlers.updated || function() {},
            entryEvicted: handlers.evicted || function() {}
        });
        
        if (options.key) map.addEntryListener(listener, Object(options.key));
        else if (options.local) map.addLocalEntryListener(listener);
        else map.addEntryListener(listener, options.includeValue);
        
        listener.remove = function() {
            if (options.key) map.removeEntryListener(listener, Object(options.key));
            else map.removeEntryListener(listener);
        };
        
        return listener;
    },
    
    watch: objectWatcher({
        added: function(e) console.info(e),
        removed: function(e) console.info(e),
        updated: function(e) console.info(e),
        evicted: function(e) console.info(e)
    })
};

exports.items = {
    listen: function(collection, handlers) {
        var listener = new com.hazelcast.core.ItemListener({
            itemAdded: handlers.added || function() {},
            itemRemoved: handlers.removed || function() {}
        });
        
        collection.addItemListener(listener, true);
        
        listener.remove = function() {
            collection.removeItemListener(listener);
        };
        
        return listener;
    },
    
    watch: objectWatcher({
        added: function(e) console.info('ItemEvent { added: ' + e + ' }'),
        removed: function(e) console.info('ItemEvent { removed: ' + e + ' }')
    })
};

exports.messages = {
    listen: function(topic, handlers) {
        var listener = new com.hazelcast.core.MessageListener({
            onMessage: handlers.on || function() {}
        });
        
        topic.addMessageListener(listener);
        
        listener.remove = function() {
            topic.removeMessageListener(listener);
        };
        
        return listener;
    },
    
    watch: objectWatcher({
        on: function(e) console.info('MessageEvent { ' + e + ' }')
    })
};
