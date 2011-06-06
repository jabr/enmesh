import java.io.Serializable
import java.util.concurrent.Callable

import com.hazelcast.core.Hazelcast
import com.hazelcast.core.Member

class Task
  implements Serializable
  implements Callable
  
  def call:dynamic
    {'member' => Hazelcast.getCluster().getLocalMember()}
  end
end
