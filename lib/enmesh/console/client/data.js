cluster.data = {
    members: {},
    partitions: [],
    instances: {},
    watching: null,
    
    watch: function(type, name) {
        this.unwatch();
        forthwith.remote.watch(type, name);
        this.watching = {type: type, name: name};
        if (type == 'map') forthwith.remote.entries(name);
    },
    unwatch: function() {
        if (this.watching) {
            forthwith.remote.unwatch(this.watching.type, this.watching.name);
            this.watching = null;
        }
    }
};

forthwith.connected = function() {
    this.members = function(members) {
        cluster.data.members = {};
        members.map(function(member) {
            cluster.data.members[member.address] = member;
        });
        cluster.interface.update.members();
    };
    this.member = function(type, member) {
        if (type == 'removed')
            delete cluster.data.members[member.address];
        else
            cluster.data.members[member.address] = member;
        cluster.interface.update.members();
    };
    
    this.partitions = function(partitions) {
        cluster.data.partitions = partitions;
        cluster.interface.update.partitions();
    };
    this.migration = function(type, event) {
        if (type == 'completed') {
            var entry = cluster.data.partitions[event.id];
            entry.from = event.old;
            entry.owner = event.new;
            cluster.interface.update.partition(entry);
        }
    };
    
    this.instances = function(instances) {
        cluster.data.instances = instances;
        cluster.interface.update.instances();
    };
    
    this.instance = function(type, event) {
        console.log(arguments);
        if (type == 'destroyed')
            delete cluster.data.instances[event.name];
        else
            cluster.data.instances[event.name] = event.type;
        cluster.interface.update.instances();
    };
    
    this.entries = function(map, entries) {
        var watching = cluster.data.watching;
        if (!watching || watching.type != 'map' || watching.name != map) return;
        watching.data = entries.reduce(function(result, entry) {
            result[entry.key] = entry;
            return result;
        }, {});
        cluster.interface.update.watching();
    };
    this.entry = function(type, map, entry) {
        var watching = cluster.data.watching;
        if (!watching || watching.type != 'map' || watching.name != map) return;
        if (type == 'removed' || type == 'evicted') {
            delete watching.data[entry.key];
        } else {
            watching.data[entry.key] = entry;
        }
        cluster.interface.update.watching();
    };
    
    this.message = function(topic, message) {
        var watching = cluster.data.watching;
        if (!watching || watching.type != 'topic' || watching.name != topic) return;
        watching.data = watching.data || [];
        watching.data.append(message);
        cluster.interface.update.watching();
    };
};

forthwith.message = function(message) {
    if (message.begin) {
        forthwith.remote.members();
        forthwith.remote.partitions();
        setTimeout(function() { forthwith.remote.instances(); }, 1000);
        cluster.interface.refresh();
    }
};

forthwith.connect();
