var colors = [
    [205,  71,  41],
    [ 28, 100,  53],
    [120,  57,  40],
    [  0,  69,  50],
    [271,  39,  57],
    [ 10,  30,  42],
    [318,  66,  68],
    [  0,   0,  50],
    [ 60,  70,  44],
    [186,  80,  45],
];

cluster.interface = {
    refresh: function() {
        cluster.data.unwatch();
        var hash = window.location.hash || '';
        var parts = hash.replace(/^#/, '').split('/');
        var view = parts.shift();
        var type = parts.shift();
        var name = parts.join('/');
        
        switch (view) {
            case 'instance':
                $('#instance .data').empty();
                $('#content').prop('class', 'instance');
                $('#instance .type').text(type);
                $('#instance .name').text(name);
                cluster.data.watch(type, name);
                break;
            case 'instances':
                $('#content').prop('class', 'instances');
                break;
            case 'partitions':
            case '':
                forthwith.remote.partitions();
                $('#content').prop('class', 'partitions');
                break;
            default:
                $('#content').prop('class', '');
                break;
        };
    },
    
    update: {
        members: function() {
            var members = $('#members .data');
            members.empty();

            Object.keys(cluster.data.members).forEach(function(member, index) {
                var color = colors[index % colors.length];
                var data = cluster.data.members[member];
                data.color = 'hsl(' + [color[0], color[1] + '%', color[2] + '%'].join(',') + ')';
                var entry = $.tmpl('<div class="member">${client}${local}${address}</div>', {
                    address: data.address,
                    local: data.local ? '@' : '',
                    client: data.client ? '-' : ''
                });
                entry.css('background-color', data.color);
                members.append(entry);
            });
            
            this.partitions();
        },
        
        partitions: function() {
            var partitions = $('#partitions .data');
            partitions.empty();

            cluster.data.partitions.forEach(function(partition) {
                var entry = $.tmpl('<div class="partition" id="partition-${id}" title="${owner}">${id}</div>', partition);
                var owner = cluster.data.members[partition.owner] || {color: 'black'};
                entry.css('background-color', owner.color);
                partitions.append(entry);
            });
            
            this.watching();
        },
        
        partition: function(partition) {
            var entry = $('#partition-' + partition.id);
            var owner = cluster.data.members[partition.owner] || {color: 'black'};
            entry.css('background-color', owner.color);
            
            this.watching();
        },
        
        instances: function() {
            var instances = $('#instances .data');
            instances.empty();
            
            var data = cluster.data.instances;
            Object.keys(data).sort().forEach(function(name) {
                var instance = $.tmpl('<div class="instance" id="instance-${name}">${type}: <a href="#instance/${type}/${name}">${name}</a></div>', {name: name, type: data[name]});
                instances.append(instance);
            });
        },
        
        watching: function() {
            var instance = $('#instance .data');
            instance.empty();
            
            var data = (cluster.data.watching && cluster.data.watching.data) || {};
            Object.keys(data).sort().forEach(function(name, index) {
                var partition = cluster.data.partitions[data[name].partition];
                var entry = $.tmpl('<tr class="data" id="data-${name}"><td>${partition}</td><td><span title="${partition} - ${owner}">${name}</span></td><td>${value}</td></tr>', {name: name, value: JSON.stringify(data[name].value, null, 1), partition: partition.id, owner: partition.owner});
                if (index % 2) entry.addClass('alt');
                entry.css('color', cluster.data.members[partition.owner].color);
                instance.append(entry);
            })
        },
    },
};

$(window).bind('hashchange', cluster.interface.refresh);
