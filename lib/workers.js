var register = function(name, implementation) {
    Packages.enmesh.Workers.register(name, new Packages.enmesh.Worker({
        apply: implementation
    }));
};

register('echo', function(data) {
    return data.toString() + ' (' + this.member() + ') [' + this.time() + ']';
});

exports.Workers = {
    register: register,
    
    run: function(name, data) {
        return Packages.enmesh.Tasks.execute(name, data);
    },
    
    runLocally: function(name, data) {
        var task = new Packages.enmesh.Task(name, data);
        return Packages.enmesh.Tasks.executeLocally(task);
    },
    
    runEverywhere: function(name, data) {
        var task = new Packages.enmesh.Task(name, data);
        return Packages.enmesh.Tasks.executeEverywhere(task);
    },
    
    runAtKey: function(name, data, key) {
        var task = new Packages.enmesh.Task(name, data);
        return Packages.enmesh.Tasks.execute(task, key);
    }
}
