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

import java.lang.Thread
import java.lang.InterruptedException

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
  
  def self.processQueue(queueName:string, worker:Worker):Thread
    processQueue(queueName, null, worker)
  end
  
  def self.processQueue(inputQueueName:string, outputQueueName:string, worker:Worker):Thread
    thread = Thread.new do
      inputQueue = Hazelcast.getQueue(inputQueueName)
      outputQueue = Hazelcast.getQueue(outputQueueName) if outputQueueName
      
      begin
        while true
          request = Serializable(inputQueue.take())
          if request
            result = worker.apply(request)
            outputQueue.put(dynamic(result)) if outputQueue
          end
        end
      rescue InterruptedException => e
      end
    end
    
    thread.start
    return thread
  end
end
