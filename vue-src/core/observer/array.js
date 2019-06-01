/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
// https://cn.vuejs.org/v2/guide/list.html#%E6%95%B0%E7%BB%84%E6%9B%B4%E6%96%B0%E6%A3%80%E6%B5%8B
// 
methodsToPatch.forEach(function (method) {
  // cache original method
  // 数组的原生方法缓存起来，后面要调用
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 调用原生的数组方法
    const result = original.apply(this, args)
    // ob是一个 Observer 实例
    const ob = this.__ob__
    let inserted
    // push、unshift、splice这些方法，会带来新的数据元素
    // 新增的元素也是需要被配置为可观测数据的
    // 所以要对新增的元素调用observer实例上的observeArray方法进行一遍观测处理
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 数组变更了，dep通知所有注册的观察者进行响应式处理
    ob.dep.notify()
    return result
  })
})
