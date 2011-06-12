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
