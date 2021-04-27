'use strict'

class ClientsClientRefreshToken {
    get rules() {
        return {
            refresh_token: 'required'
        }
    }
}

module.exports = ClientsClientRefreshToken
