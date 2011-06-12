import java.io.Serializable
import java.util.concurrent.Callable

import enmesh.Workers

class Task
  implements Serializable
  implements Callable
  
  def initialize(name:string, data:Serializable)
    @name = name
    @data = data
  end
  
  def call:dynamic
    Workers.execute(@name, @data)
  end
end

import olio.Deferred

import java.util.Set
import java.util.concurrent.Future

import com.hazelcast.core.Hazelcast
import com.hazelcast.core.Member
import com.hazelcast.core.DistributedTask
import com.hazelcast.core.MultiTask
import com.hazelcast.core.ExecutionCallback

class HazelcastDeferred < Deferred
  implements ExecutionCallback
  
  def initialize(future:Future)
    super(future)
  end
  
  def done(result:Future):void
    resolve
  end
end

class Tasks
  def self.execute(name:String, data:Serializable):Deferred
    execute(Task.new(name, data))
  end
  
  def self.execute(task:Callable):Deferred
    execute(DistributedTask.new(task))
  end
  
  def self.execute(task:Callable, key:dynamic):Deferred
    execute(DistributedTask.new(task, key))
  end
  
  def self.execute(task:Callable, member:Member):Deferred
    execute(DistributedTask.new(task, member))
  end
  
  def self.executeLocally(task:Callable):Deferred
    execute(task, Hazelcast.getCluster().getLocalMember())
  end
  
  def self.execute(task:Callable, members:Set):Deferred
    execute(MultiTask.new(task, members))
  end
  
  def self.executeEverywhere(task:Callable):Deferred
    execute(task, Hazelcast.getCluster().getMembers())
  end
  
  def self.execute(task:DistributedTask):Deferred
    deferred = HazelcastDeferred.new(Future(task))
    task.setExecutionCallback(deferred)
    Hazelcast.getExecutorService().submit(task)
    return deferred
  end
end
