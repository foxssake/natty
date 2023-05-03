/**
* Return current timestamp ( seconds since epoch ).
* @returns {number}
*/
export function timestamp () {
  return (+(new Date())) / 1000
}

/**
* Sleep.
* @param {number} seconds Time to sleep in seconds
* @param {T} [value=undefined] Value to resolve to
* @returns {Promise<T>} Promise
* @template T
*/
export function sleep (seconds, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), seconds * 1000))
}

/**
* Wait for an event on event source.
* @param {any} source Event source
* @param {string} event Event name
* @returns {Promise} Promise
*/
export function promiseEvent (source, event) {
  return new Promise(resolve => {
    source.on(event, resolve)
  })
}

/**
* Wrap a function as a singleton factory.
*
* In practice, this will create a function that will cache the wrapped
* function's return value, assuming it always returns the same thing.
*
* NOTE: This will evaluate the method while wrapping.
*
* @param {function(): T} f Function to wrap
* @returns {function(): T} Singleton factory function
* @template T
*/
export function asSingletonFactory (f) {
  const value = f()
  return () => value
}

/**
* Maps an input array into chunks of a given size. The last chunk might be
* smaller than the requested size.
*
* @param {T[]} data Data
* @param {number} size Chunk size
* @returns {T[][]} An array of chunks
* @template T
*/
export function chunks (data, size) {
  const count = Math.ceil(data.length / size)
  return [...new Array(count)]
    .map((_, i) => data.slice(i * size, (i + 1) * size))
}

/**
* Symbol for timeout.
*/
export const Timeout = Symbol('timeout')

/**
* Limit a promise run to a given timeout.
*
* If the promise doesn't resolve in time, the Timeout symbol will be returned.
* Otherwise, the promise's result will be passed through.
* @param {Promise<T>} promise Promise
* @param {number} timeout Timeout in seconds
* @returns {Promise<T | Symbol>} Promise result or Timeout symbol
* @template T
*/
export function withTimeout (promise, timeout) {
  return Promise.race([
    sleep(timeout, Timeout),
    promise
  ])
}
