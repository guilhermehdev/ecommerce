'use strict'

class UserStoreUser {
    get rules() {
        let userId = this.ctx.params.id
        let rule = ''
        if (userId) {
            rule = `unique:users,email,id,${userId}`
        } else {
            rule = `unique:users,email|required`
        }
        return {
            email: rule,
            image_id: 'exists:images,id'
        }
    }

    get messages() {
        return {
            'email.unique': 'O e-mail já existe!',
            'email.required': 'O campo e-mail é obrigatório',
            'image_id.exists': 'A imagem especificada não existe!'
        }
    }
}

module.exports = UserStoreUser
