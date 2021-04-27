'use strict'

const User = use('App/Models/User')
const UserTransformer = use('App/Transformers/User/UserTransformer')

class UserController {
    async me({ response, transform, auth }) {
        const user = await auth.getUser()
        const userData = await transform.item(user, UserTransformer)
        userData.roles = await user.getRoles()
        return response.send(userData)
    }
}

module.exports = UserController
