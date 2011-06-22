cluster.data = {
    members: {},
    partitions: []
};

forthwith.connected = function() {
    this.members = function(members) {
        cluster.data.members = {};
        members.map(function(member) {
            cluster.data.members[member.address] = member;
        });
    };
    this.memberAdded = function(member) {
        cluster.data.members[member.address] = member;
    };
    this.memberRemoved = function(member) {
        delete cluster.data.members[member.address];
    };
    
    this.partitions = function(partitions) {
        cluster.data.partitions = partitions;
    };
    this.migrationStarted = function(event) {
        console.log('started');
        var entry = cluster.data.partitions[event.id];
        entry.from = event.old;
        entry.to = event.new;
    };
    this.migrationCompleted = function(event) {
        console.log('completed');
        var entry = cluster.data.partitions[event.id];
        entry.previous = entry.owner;
        entry.from = event.old;
        entry.owner = event.new;
        entry.target = null;
    };
};

forthwith.message = function(message) {
    console.log('message', message);
    if (message.begin) {
        forthwith.remote.members();
        forthwith.remote.partitions();
    }
};

forthwith.connect();
