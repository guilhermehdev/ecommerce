'use stric';
const Database = use('Database');
const { calcPercent } = use('App/Helpers');
const Discount = use('App/Models/Discount');

class OrderService {
  constructor(modelInstance, trx) {
    this.model = modelInstance;
    this.trx = trx;
  }

  async syncItems(items) {
    await this.model.items().delete(this.trx);
    return await this.model.items().createMany(items, this.trx);
  }

  async updateItems(items) {
    let currentItems = await this.model
      .items()
      .whereIn(
        'id',
        items.map(item => item.id)
      )
      .fetch();
    // Deleta os itens que não estão em `items`
    await this.model
      .items()
      .whereNotIn(
        'id',
        items.map(item => item.id)
      )
      .delete(this.trx);

    // Atualiza os valores e quantidades dos itens armazenados em `items`
    await Promise.all(
      currentItems.rows.map(async item => {
        item.fill(items.filter(n => n.id === item.id)[0]);
        await item.save(this.trx);
      })
    );
  }

  async canApplyDiscount(coupon) {
    const now = new Date().getTime();

    if (
      now > coupon.valid_from.getTime() ||
      (typeof coupon.valid_until == 'object' &&
        coupon.valid_until.getTime() < now)
    ) {
      return false;
    }
    const couponProducts = await Database.from('coupon_product')
      .where('coupon_id', coupon.id)
      .pluck('product_id'); // retorna um array com os IDs

    const couponClients = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id'); // retorna um array de IDs

    // verifica se o cupom está associado a produtos ou usuários especifios
    if (
      Array.isArray(couponProducts) &&
      couponProducts.length < 1 &&
      Array.isArray(couponClients) &&
      couponClients.length < 1
    ) {
      /**
       * caso nao esteja associado a um cliente especifico ou
       * a um produto específico, é um cupom de uso livre
       * e todo os clientes podem utiliza-lo para aplicar descontos em seus pedidos
       */
      return true;
    }

    /**
     * Verifico se o cupom está associado a algum
     * Produto ou Cliente
     */
    let isAssociatedToProducts,
      isAssociatedToClients = false;

    // verifica se este cupom tem algum produto associado
    if (Array.isArray(couponProducts) && couponProducts.length > 0) {
      isAssociatedToProducts = true;
    }

    if (Array.isArray(couponClients) && couponClients.length > 0) {
      isAssociatedToClients = true;
    }

    /**
     * Vai verificar quais produtos associados ao cupom, estão associados a este pedido também
     */
    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id');

    /**
     * CASO DE USO 1 - o cupom está associado a clientes e produtos
     */
    if (isAssociatedToClients && isAssociatedToProducts) {
      // se estiver, verifica se o cliente que fez o pedido pode utilizar o cupom
      const clientMatch = couponClients.filter(
        client => client === this.model.user_id
      )[0];

      /**
       *  caso o cupom esteja associado a clientes E produtos e o
       * Cliente que fez o pedido, tiver comprado produtos que também estão associados ao cupom
       * ele poderá aplicar este cupom ao pedido
       */
      if (
        clientMatch &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      ) {
        return true;
      }
    }

    /**
     * CASO DE USO 2 - o cupom está associado apenas a produtos
     * devemos verificar se algum dos produtos associados ao cupom
     * está na lista de itens deste pedido
     */
    if (
      isAssociatedToProducts &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    ) {
      return true;
    }

    /**
     * CASO DE USO 2 - O cupom está associado apenas a 1 ou mais clientes
     * devemos verificar se o cliente que fez o pedido atual, está autorizado a utilizar este cupom
     */
    if (
      isAssociatedToClients &&
      Array.isArray(couponClients) &&
      couponClients.length > 0
    ) {
      const match = couponClients.filter(
        client => client === this.model.user_id
      )[0];
      if (match) {
        return true;
      }
    }

    /**
     * Caso nenhuma das verificações acima seja positiva
     * Então o cupom está associado a clientes e/ou produtos
     * Porém o cliente que fez o pedido atual, não está na lista de clientes
     * autorizados a usar este cupom, ou então, nenhum dos produtos que
     * ele comprou neste pedido, estão na lista de produtos com desconto.
     */
    return false;
  }
}

module.exports = OrderService;
