setInterval(function() {
    $('#members .data').html(
        Object.keys(cluster.data.members).join('<br>')
    );
    
    $('#partitions .data').html(
        cluster.data.partitions.map(function(partition) {
            return [partition.id, partition.owner].join(' ');
        }).join('<br>')
    )
}, 500);
