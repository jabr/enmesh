interface Function do
  def apply(parameter:dynamic):dynamic;end
end

import java.util.ArrayList
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit

class Deferred
  implements Future
  
  def initialize(future:Future)
    @future = future
    @deferrals = ArrayList.new
  end
  
  def resolve:void
    @deferrals.each { |deferral| Deferred(deferral).resolve }
    @deferrals.clear()
  end
  
  def then(function:Function):Deferred
    deferred = DeferredFunction.new(self, function)
    if @future.isDone
      deferred.resolve
    else
      @deferrals.add(deferred)
    end
    deferred
  end
  
  def cancel(mayInterruptIfRunning:boolean):boolean
    @future.cancel(mayInterruptIfRunning)
  end
  
  def get:dynamic
    @future.get
  end
  
  def get(timeout:long, unit:TimeUnit):dynamic
    @future.get(timeout, unit)
  end
  
  def isCancelled:boolean
    @future.isCancelled
  end
  
  def isDone:boolean
    @future.isDone
  end
  
  protected
  def getFuture:Future
    @future
  end
end

class DeferredFunction < Deferred
  def initialize(future:Future, function:Function)
    super(future)
    @function = function
    @result = dynamic(nil)
  end
  
  def resolve:void
    @result = @function.apply(getFuture.get) unless isCancelled
    super()
  end
  
  def get:dynamic
    super()
    @result
  end
  
  def get(timeout:long, unit:TimeUnit):dynamic
    super(timeout, unit)
    @result
  end
end

class Present
  implements Future
  
  def initialize(result:dynamic)
    @result = result
  end
  
  def get:dynamic
    @result
  end
  
  def get(timeout:long, unit:TimeUnit):dynamic
    @result
  end
  
  def cancel(mayInterruptIfRunning:boolean):boolean
    false
  end
  
  def isCancelled:boolean
    false
  end
  
  def isDone:boolean
    true
  end
end

import java.util.concurrent.CountDownLatch

class ResolvableFuture
  implements Future
  
  def initialize
    @latch = CountDownLatch.new(1)
    @result = dynamic(nil)
  end
  
  def resolve(result:dynamic):void
    @result = result
    @latch.countDown()
  end
  
  def get:dynamic
    @latch.await
    return @result
  end
  
  def get(timeout:long, unit:TimeUnit):dynamic
    @latch.await(timeout, unit)
    return @result
  end
  
  def cancel(mayInterruptIfRunning:boolean):boolean
    false
  end
  
  def isCancelled:boolean
    false
  end
  
  def isDone:boolean
    @latch.getCount() == 0
  end
end
