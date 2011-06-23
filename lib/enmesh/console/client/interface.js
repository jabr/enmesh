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
        },
        
        partition: function(partition) {
            var entry = $('#partition-' + partition.id);
            var owner = cluster.data.members[partition.owner] || {color: 'black'};
            entry.css('background-color', owner.color);
        }
    }
};
