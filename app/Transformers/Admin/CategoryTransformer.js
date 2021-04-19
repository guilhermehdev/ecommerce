'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const ImageTransformer = use('App/Transformers/Image/ImageTransformer')
/**
 * CategoriesTransformer class
 *
 * @class CategoriesTransformer
 * @constructor
 */
class CategoriesTransformer extends TransformerAbstract {
    defaultInclude() {
        return ['image']
    }

    /**
     * This method is used to transform the data.
     */
    transform(category) {
        return {
            id: category.id,
            title: category.title,
            description: category.description
        }
    }

    includeImage(category) {
        return this.item(category.getRelated('image'), ImageTransformer)
    }
}

module.exports = CategoriesTransformer