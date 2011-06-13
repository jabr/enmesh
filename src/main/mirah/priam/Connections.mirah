import org.apache.thrift.protocol.TBinaryProtocol
import org.apache.thrift.transport.TSocket
import org.apache.thrift.transport.TTransport
import org.apache.thrift.transport.TFramedTransport
import org.apache.cassandra.thrift.Cassandra

class Connection
  def initialize(node:string, port:int)
    socket = TSocket.new(node, port)
    @transport = TTransport(TFramedTransport.new(socket))
    protocol = TBinaryProtocol.new(@transport)
    @client = Cassandra.Client.new(protocol)
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
