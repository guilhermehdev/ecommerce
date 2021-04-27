'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')

/**
 * CodeTransformer class
 *
 * @class CodeTransformer
 * @constructor
 */
class CodeTransformer extends TransformerAbstract {
  /**
   * This method is used to transform the data.
   */
  transform(model) {
    return model.code
  }
}

module.exports = CodeTransformer
