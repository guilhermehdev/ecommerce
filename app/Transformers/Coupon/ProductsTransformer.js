'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')

/**
 * ProductsTransformer class
 *
 * @class ProductsTransformer
 * @constructor
 */
class ProductsTransformer extends TransformerAbstract {
    /**
     * This method is used to transform the data.
     */
    transform(product) {
        return {
            id: product.id,
            name: product.name,
            price: product.price
        }
    }
}

module.exports = ProductsTransformer
