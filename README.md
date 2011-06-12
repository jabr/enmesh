# enmesh: Hazelcast on RingoJS

A distributed, highly available, fault tolerant, peer-to-peer cluster of [RingoJS](http://www.ringojs.org/) instances using the [Hazelcast data/computing grid](http://www.hazelcast.com/).

_This project is at a very early stage, but it currently provides a Javascript REPR interface to Hazelcast functionality._

## Examples

    $ ./enmesh
    
    >> users = Hazelcast.engine.getMap('users')
    [com.hazelcast.impl.FactoryImpl$MProxyImpl Map [users] HazelcastInstance {name='_hzInstance_0_dev'}]
    
    >> users.put('joe', 'data')
    null
    
    >> users.get('joe')
    'data'
    
    >> Workers.register('concat', function(string) string + ' ' + this.member())
    >> Workers.run('concat', 'This was run on').get()
    'This was run on Member [192.168.1.100:5701] this'
    
    >> Workers.runEverywhere('concat', 'This was run on').get()
    [java.util.concurrent.CopyOnWriteArrayList [This was run on Member [192.168.1.100:5702] this, This was run on Member [192.168.1.100:5701] this]]
    
    >> Workers.run('concat', 'This was run on').then(function(result) console.info(result))
    [info] This was run on Member [192.168.1.100:5701] this (<stdin>:86)
    [olio.DeferredFunction olio.DeferredFunction@2945c761]
    
## Requirements

* RingoJS: <http://www.ringojs.org/>
* Mirah: <http://www.mirah.org/>

## See also

* Hazelcast documentation: <http://www.hazelcast.com/documentation.jsp>
