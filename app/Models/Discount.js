'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Discount extends Model {
  static boot() {
    super.boot();

    this.addHook('beforeSave', 'DiscountHook.calculateValues');
    this.addHook('afterSave', 'DiscountHook.decrementCoupons');
    this.addHook('afterDelete', 'DiscountHook.incrementCoupons');
  }

  static get table() {
    return 'coupon_order';
  }

  order() {
    return this.belongsTo('App/Models/Order', 'order_id', 'id');
  }

  coupon() {
    return this.belongsTo('App/Models/Coupon', 'coupon_id', 'id');
  }

  /**
   * Diz para o ORM que este model não tem os campos created_at e updated_at
   */
  static get createdAtColumn() {
    return null;
  }

  static get updatedAtColumn() {
    return null;
  }
}

module.exports = Discount;
