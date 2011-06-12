import java.io.Serializable
import olio.Function

import com.hazelcast.core.Hazelcast
import com.hazelcast.core.Member

import java.lang.Object

abstract class Worker
  implements Function
  
  def apply(parameter:Serializable):Serializable
    nil
  end
  
  protected
  def member:Member
    Hazelcast.getCluster().getLocalMember()
  end
  
  def time:long
    Hazelcast.getCluster().getClusterTime()
  end
end

class Workers
  def self.register(name:string, worker:Worker):void
    @workers ||= {}
    @workers[name] = worker
  end
  
  def self.execute(name:string, parameter:Serializable):Serializable
    return nil unless @workers
    worker = Worker(@workers[name])
    return nil unless worker
    return worker.apply(parameter)
  end
end
