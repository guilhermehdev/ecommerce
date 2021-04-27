'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const ImageTransformer = use('App/Transformers/Image/ImageTransformer')

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends TransformerAbstract {
    defaultInclude() {
        return ['image']
    }
    /**
     * This method is used to transform the data.
     */
    transform(user) {
        user = user.toJSON()
        delete user.updated_at
        delete user.image_id
        return user
    }

    includeImage(user) {
        return this.item(user.getRelated('image'), ImageTransformer)
    }
}

module.exports = UserTransformer
