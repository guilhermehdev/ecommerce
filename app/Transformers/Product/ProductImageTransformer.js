'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')

/**
 * ProductImageTransformer class
 *
 * @class ProductImageTransformer
 * @constructor
 */
class ProductImageTransformer extends TransformerAbstract {
    /**
     * This method is used to transform the data.
     */
    transform(image) {
        image = image.toJSON()
        return {
            id: image.id,
            url: image.url
        }
    }
}

module.exports = ProductImageTransformer
