'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends TransformerAbstract {
    /**
     * This method is used to transform the data.
     */
    transform(user) {
        return {
            id: user.id,
            name: `${user.name} ${user.surname}`
        }
    }
}

module.exports = UserTransformer
