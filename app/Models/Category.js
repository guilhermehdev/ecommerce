'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {
    /**
     * Relacionamento entre Categoria e Imagem
     */
    image() {
        return this.belongsTo('App/Models/Image')
    }

    /**
     * Relacionamento entre Category e Product
     *
     */
    products() {
        return this.belongsToMany('App/Models/Product')
    }
}

module.exports = Category
