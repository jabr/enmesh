var {Hazelcast} = require('hazelcast');
var Objects = require('ringo/utils/objects');
var {core} = require('core');

var _topic = null;
var exported = {
    get topic() {
        if (!_topic) _topic = Hazelcast.topic('entities/events');
        return _topic;
    }
};

exported.listen = function(on) {
    return Hazelcast.events.messages.listen(exported.topic, {
        on: function(message) on(core.json(message))
    });
};

exported.publish = function(subject, type, data) {
    var message = Objects.merge({
        subject: subject,
        type: type || 'data',
        time: Date.now()
    }, data || {});
    
    exported.topic.publish(JSON.stringify(message));
}

exports.Events = exported;
