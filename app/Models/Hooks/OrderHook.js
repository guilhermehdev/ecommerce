'use strict';

const OrderHook = (exports = module.exports = {});

OrderHook.updateValues = async modelInstance => {
  modelInstance.$sideLoaded.subtotal = await modelInstance
    .items()
    .getSum('subtotal');
  modelInstance.$sideLoaded.qty_items = await modelInstance
    .items()
    .getSum('quantity');
  modelInstance.$sideLoaded.discount = await modelInstance
    .discounts()
    .getSum('discount');
  modelInstance.total =
    modelInstance.$sideLoaded.subtotal - modelInstance.$sideLoaded.discount;
  return modelInstance;
};

OrderHook.updateCollectionValues = async models => {
  for (let model of models) {
    model = await OrderHook.updateValues(model);
  }
};
