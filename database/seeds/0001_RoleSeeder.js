'use strict';

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Role = use('Role');

class RoleSeeder {
  async run() {
    const admin = new Role();
    admin.name = 'Admin';
    admin.slug = 'admin';
    admin.description = 'Administrador do Sistema';
    await admin.save();

    const manager = new Role();
    manager.name = 'Gerente';
    manager.slug = 'manager';
    manager.description = 'Manager do Sistema';
    await manager.save();

    const client = new Role();
    client.name = 'Cliente';
    client.slug = 'client';
    client.description = 'Cliente do Sistema';
    await client.save();
  }
}

module.exports = RoleSeeder;
