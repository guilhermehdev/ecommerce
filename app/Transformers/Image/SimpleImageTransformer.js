'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')

/**
 * ImageTransformer class
 *
 * @class ImageTransformer
 * @constructor
 */
class ImageTransformer extends TransformerAbstract {
    /**
     * This method is used to transform the data.
     */
    transform(image) {
        image = image.toJSON()
        return image.url
    }
}

module.exports = ImageTransformer
