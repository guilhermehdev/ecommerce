'use strict';

const User = use('App/Models/User');
const Role = use('Role');
const Database = use('Database');
const PasswordReset = use('App/Models/PasswordReset');
const Mail = use('Mail');
const Env = use('Env');
const Ws = use('Ws');

class AuthController {
  async register({ request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const { name, surname, email, password } = request.all();

      const user = await User.create({ name, surname, email, password }, trx);

      const userRole = await Role.findBy('slug', 'client');

      // Associa o userRole ao User
      await user.roles().attach([userRole.id], null, trx);
      // Envia uma notificação de cadastro
      const topic = Ws.getChannel('notifications').topic('notifications');
      if (topic) {
        topic.broadcast('new:user', 'Novo usuário cadastrado!');
      }

      // commita a transaction
      await trx.commit();
      return response.status(201).send({ data: user });
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Erro ao realizar cadastro',
        message: e.message,
      });
    }
  }

  async login({ request, response, auth, transform }) {
    const { email, password } = request.all();

    let data = await auth.withRefreshToken().attempt(email, password);

    return response.send({ data });
  }

  async refresh({ request, response, auth }) {
    const refresh_token = request.input('refresh_token');

    if (!refresh_token) {
      refresh_token = request.header('refresh_token');
    }

    const user = await auth
      .newRefreshToken()
      .generateForRefreshToken(refresh_token);

    return response.send({ data: user });
  }

  async logout({ request, response, auth }) {
    let refresh_token = request.input('refresh_token');

    if (!refresh_token) {
      refresh_token = request.header('refresh_token');
    }

    const loggedOut = await auth
      .authenticator('jwt')
      .revokeTokens([refresh_token], true);

    return response.status(204).send({});
  }

  async forgot({ request, response }) {
    const user = await User.findByOrFail('email', request.input('email'));
    const req = request;
    try {
      /**
       * Invalida qualquer outro token que tenha sido gerado anteriormente
       */
      await PasswordReset.query().where('email', user.email).delete();

      /**
       * gera um novo token para reset da senha
       */
      const reset = await PasswordReset.create({ email: user.email });

      // Envia um novo e-mail para o Usuário, com um token para que ele possa alterar a senha
      await Mail.send(
        'emails.reset',
        { user, reset, referer: req.request.headers['referer'] },
        message => {
          message
            .to(user.email)
            .from(Env.get('DO_NOT_ANSWER_EMAIL'))
            .subject('Solicitação de Alteração de Senha');
        }
      );

      return response.status(201).send({
        message:
          'Um e-mail com link para reset foi enviado para o endereço informado!',
      });
    } catch (error) {
      return response.status(400).send({
        message: 'Ocorreu um erro inesperado ao executar a sua solicitação!',
      });
    }
  }

  async remember({ request, response }) {
    const reset = await PasswordReset.query()
      .where('token', request.input('token'))
      .where('expires_at', '>=', new Date())
      .firstOrFail();

    return response.send(reset);
  }

  async reset({ request, response }) {
    const { email, password } = request.all();
    const user = await User.findByOrFail('email', email);
    try {
      user.merge({ password });
      await user.save();
      /**
       * Invalida qualquer outro token que tenha sido gerado anteriormente
       */
      await PasswordReset.query().where('email', user.email).delete();
      return response.send({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possivel alterar a sua senha!' });
    }
  }
}

module.exports = AuthController;
