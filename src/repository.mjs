/**
* Mapper function to retrieve ID from item
* @template T,K
* @typedef {function(T): K} RepositoryIdMapper
*/

/**
* Function to merge two objects for updating the repository.
* It takes the original and the updated, and returns the merged.
* @template T
* @typedef {function(T, T): T} RepositoryItemMerger
*/

/**
* Base class for repositories.
* @template T,K
*/
export class Repository {
  /** @type {Map<K, T>} */
  #items = new Map()

  /** @type {function(T): K} */
  #idMapper

  /** @type {function(T, T): T} */
  #merger

  /**
  * Construct repository.
  * @param {object} options Options
  * @param {RepositoryIdMapper} options.idMapper Id mapper
  * @param {RepositoryItemMerger} options.itemMerger Item merger
  */
  constructor (options) {
    this.#idMapper = options.idMapper
    this.#merger = options.itemMerger
  }

  /**
  * Add item to repository.
  * @param {T} item Item
  * @returns {T} Stored item
  * @throws if item id is already in use
  */
  add (item) {
    const id = this.#idMapper(item)

    if (this.has(id)) {
      throw new Error(`Item already stored with id: ${id}`)
    }

    this.#items.set(id, item)

    return item
  }

  /**
  * Update an existing item.
  * @param {T} item Item
  * @throws if item id not known
  */
  update (item) {
    const id = this.#idMapper(item)

    if (!this.has(id)) {
      throw new Error(`Trying to update unknown item with id: ${id}`)
    }

    this.#items.set(id, this.#merger(
      this.find(id),
      item
    ))
  }

  /**
  * Find item based on id.
  * @param {K} id Item id
  * @returns {T | undefined} Item or undefined
  */
  find (id) {
    // TODO: Consider freezing?
    return this.#items.get(id)
  }

  /**
  * Check if item exists.
  * @param {K} id Item id
  * @returns {boolean} Whether the item exists
  */
  has (id) {
    return this.#items.has(id)
  }

  /**
  * List all items in repository.
  * @returns {IterableIterator<T>} Items
  */
  list () {
    return this.#items.values()
  }

  /**
  * Remove item by id.
  * @param {K} id Item id
  * @returns {boolean} Whether any item was deleted
  */
  remove (id) {
    return this.#items.delete(id)
  }
}
