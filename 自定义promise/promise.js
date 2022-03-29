/**
 * 
 *自定义Promise模块
 */
(function (w) {
    const PENDDING = 'pendding';
    const RESOLVED = 'resolved';
    const REJECTED = 'rejected';
/**
 * Promise构造函数的两个作用
 * 1.改变promise的状态
 * 2.调用成功/失败的回调
 * 
 */
  function Promise(excutor){
     
    const self = this;
    self.status = PENDDING;
    self.data = undefined;
    self.callback = [];
    
    function resolve(value) {
      if(self.status !== PENDDING) return;
      self.status = RESOLVED;
      self.data = value;
      if(self.callback.length>0){
        //调用成功/失败的任务必须是异步执行
        setTimeout(() => {
          self.callback.forEach((obj) => {
            obj.onResolved(self.data);
        })
        });
       
      }
    }
    function reject(reason) {
      if(self.status !== PENDDING) return;
      self.status = REJECTED;
      self.data = reason;
      if(self.callback.length>0){
         //调用成功/失败的任务必须是异步执行
        setTimeout(() => {
          self.callback.forEach((obj) => {
            obj.onRejected(reason);
         })
        });
      }
    }
    //如果执行器函数执行错误
    try{
      excutor(resolve,reject);
    }catch(error){
      reject(error);
    }
    
  }
  /**
   * then方法的作用
   * 1.指定成功/失败的回调
   *   1.1若promise是pendding状态,保存回调函数
   *   1.2若promise是resolved状态,异步执行成功的回调函数onResolved
   *   1.3若promise是rejected状态,异步执行成功的回调函数onRejected
   * 2.返回一个新的promise对象,实现链式调用
   * 新的promise对象的结果由onResolved或onRejected回调函数执行的结果决定
   *   2.1若抛出异常,新的promise状态变为rejected,reason为抛出的异常
   *   2.2若返回的是非promise,新的promise状态变为resolved,value值为返回的值
   *   2.3若返回的是一个新的promise,此promise的结果就会变为新promise的结果
   */

  Promise.prototype.then = function (onResolved,onRejected) {
       const self = this;
      onRejected = typeof onRejected === 'function' ?  onRejected :reason => {throw reason};
      onResolved = typeof onResolved === 'function' ? onResolved : value => value ;
    return new Promise((resolve,reject) => {

    function handle(callback) {
      try{
        let result = callback(self.data);
         if(result instanceof Promise){
          result.then(
            value => resolve(value),
            reason => reject(reason)
          )          
        }else{
          resolve(result);
        }
      }catch(error){
       reject(error)
     }
    }

      if(self.status === RESOLVED){
            setTimeout(() => {              
              handle(onResolved);
           })             
      }else if(self.status === REJECTED){
        setTimeout(() => {
          handle(onRejected);
        });       
      }else{
       self.callback.push({
        onResolved (value){
          handle(onResolved);
        },
        onRejected(reason){
          handle(onRejected);
        }
      })
     }
    })
  }
  
  /*
  catch方法的作用
  1.错误穿透
  */
  Promise.prototype.catch = function (onRejected) {
     return this.then(undefined,onRejected);
  }
  /**
   * 返回一个成功/失败的promise对象
   *  value:成功的数据或promise对象
   */
  Promise.resolve = function (value) {
    return new Promise((resolve,reject) => {
      if(value instanceof Promise){
        value.then(
          value => resolve(value),
          reason => reject(reason)
        )
      }else{
        resolve(value)
      }
    })
  }
/**
 * 返回一个失败的promise对象
   reason:失败的数据
 */
  Promise.reject = function (reason) {
    return new Promise((resolve,reject) =>{
      reject(reason)
    })
  }
/**
 * promises:包含n个promise的数组
 * all方法返回一个新的promise,只有所有的promise都成功才成功,只要有一个失败了就失败 
 */
  Promise.all = function (promises) {
    let countResPromise = 0;
    let values = [];
    return new Promise((resolve,reject) =>{
      promises.forEach((obj,index)=>{
        obj.then(
          value =>{            
            values[index] = value;
            countResPromise++
            if(countResPromise===promises.length){
               resolve(values)
            }
          }
        )
      })
    })
  }
  /**
   * Promise.race方法
   * promises:包含n个promise的数组
   * 返回一个新的promise,第一个完成的promise的结果状态就是最终的结果状态
   */
  Promise.race = function (promises) {
    return new Promise((resolve,reject) => {
      promises.forEach(obj=>{
        obj.then(
          value =>{resolve(value)},          
          reason =>{reject(reason)}
        )
      })
    })
  }

  /**
   * 返回一个延迟指定成功/失败的promise(原生中没有的方法)
   */
  Promise.resolveDelay = function (value,time) {
        return new Promise((resolve,reject) => {
      setTimeout(() => {    
      if(value instanceof Promise){
        value.then(
          value => resolve(value),
          reason => reject(reason)
        )
      }else{
        resolve(value)
      }
    }, time);
    })
  }
  /**
   * 返回一个延迟指定失败的promise(原生中没有的方法)
   */
  Promise.rejectDelay = function (reason,time) {
    setTimeout(() => {
      return new Promise((resolve,reject) =>{
        reject(reason)
      })
    }, time);
  }
  //向外暴露Promise
  w.Promise = Promise;
}(window))
