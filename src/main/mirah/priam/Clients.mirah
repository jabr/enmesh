import olio.Present
import olio.Deferred

import priam.SyncConnection

interface Client do
  def describe_cluster_name:Deferred;end
end

class SyncClient
  implements Client
  
  def initialize(connection:SyncConnection)
    connection.open()
    @client = connection.client()
  end
  
  def describe_cluster_name:Deferred
    name = @client.describe_cluster_name
    return Deferred.new(Present.new(name))
  end
end

import olio.ResolvableFuture
import priam.AsyncConnection

import java.lang.Exception
import java.util.concurrent.Future

import org.apache.thrift.async.AsyncMethodCallback

import org.apache.cassandra.thrift.Cassandra.AsyncClient.*

class AsyncResult < Deferred
  implements AsyncMethodCallback
  
  def initialize
    super(Future(ResolvableFuture.new))
  end
  
  def onComplete(call:dynamic)
    # TODO: handle various async call types with inline anonymous subclasses of this
    result = dynamic(describe_cluster_name_call(call).getResult())
    ResolvableFuture(getFuture).resolve(result)
    resolve
  end
  
  def onError(exception:Exception)
    raise exception
  end
end

class AsyncClient
  implements Client
  
  def initialize(connection:AsyncConnection)
    @client = connection.client()
  end
  
  def describe_cluster_name:Deferred
    deferred = AsyncResult.new
    @client.describe_cluster_name(deferred)
    return deferred
  end
end
