'use strict'

class CategoryStore {
    get rules() {
        return {
            title: 'required',
            description: 'required'
        }
    }
}

module.exports = CategoryStore
