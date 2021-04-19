'use strict';

class AuthRegister {
  get rules() {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed',
    };
  }
  get messages(){
    return{     
      'email.required':'Email obrigatório!',
      'email.email':'Email inválido!',
      'email.unique':'Email já cadastrado!',
      'password.required':'Senha obrigatória!',
      'password.confirmed':'As senhas não correspondem!',
    }
  }
}

module.exports = AuthRegister;
