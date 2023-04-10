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
* @returns {Promise<void>} Promise
*/
export function sleep (seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
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
