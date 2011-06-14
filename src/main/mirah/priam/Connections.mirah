import org.apache.thrift.protocol.TBinaryProtocol
import org.apache.thrift.transport.TSocket
import org.apache.thrift.transport.TNonblockingSocket
import org.apache.thrift.transport.TTransport
import org.apache.thrift.transport.TFramedTransport
import org.apache.thrift.async.TAsyncClientManager
import org.apache.cassandra.thrift.Cassandra

class ConnectionPool
end

interface ConnectionManagement do
  def isOpen:boolean;end
  def open:void;end
  def close:void;end
end

abstract class Connection
  implements ConnectionManagement
end

class SyncConnection < Connection
  def initialize(node:string, port:int)
    @transport = TTransport(TFramedTransport.new(TSocket.new(node, port)))
    @client = Cassandra.Client.new(TBinaryProtocol.new(@transport))
  end
  
  def client
    @client
  end
  
  def isOpen
    @transport.isOpen
  end
  
  def open:void
    @transport.open unless @transport.isOpen
  end
  
  def close:void
    @transport.close
  end
end

class AsyncConnection < Connection
  def self.getAsyncClientManager
    @asyncClientManager ||= TAsyncClientManager.new
  end
  
  def initialize(node:string, port:int)
    # should this be wrapped in a TFramedTransport?
    @transport = TNonblockingSocket.new(node, port)
    @client = Cassandra.AsyncClient.new(
      TBinaryProtocol.Factory.new,
      AsyncConnection.getAsyncClientManager,
      @transport
    )
  end
  
  def client
    @client
  end
  
  def isOpen:boolean
    @transport.isOpen
  end
  
  def open:void
    # async transports open automatically when used
  end
  
  def close:void
    @transport.close
  end
end
