'use strict';

/*
|--------------------------------------------------------------------------
| CategoryAndProductSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

class CategoriesAndProductSeeder {
  async run() {
    const categories = await Factory.model('App/Models/Category').createMany(5);

    await Promise.all(
      categories.map(async category => {
        const products = await Factory.model('App/Models/Product').createMany(
          5
        );

        await Promise.all(
          products.map(async product => {
            // associando a categoria ao produto
            await product.categories().attach([category.id]);
            // Associa os produto aos cupons
            // const coupon = await Factory.model(
            //     'App/Models/Coupon'
            // ).create()
            // await product.coupons().attach([coupon.id])
          })
        );
      })
    );
  }
}
module.exports = CategoriesAndProductSeeder;
