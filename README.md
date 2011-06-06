# enmesh: Hazelcast on RingoJS

A distributed, highly available, fault tolerant, peer-to-peer cluster of RingoJS instances using the Hazelcast data/computing grid.

_This project is at a very early stage, but it currently provides a Javascript REPR interface to Hazelcast functionality._

## Examples

  # ./enmesh
  
  >> users = Hazelcast.engine.getMap('users')
  >> users.put('joe', 'data')
  null
  >> users.get('joe')
  'data'
  
  >> callback = function(value) console.log(value.get())
  >> Hazelcast.execute(Packages.enmesh.Task, callback)
  [info] {member=Member [192.168.1.100:5701]} (<stdin>:111)
