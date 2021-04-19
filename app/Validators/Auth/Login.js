'use strict';

class Login {
  get rules() {
    return {
      // validation rules
      email: 'required|email',
      password: 'required',
    };
  }
  get messages(){
    return{
      'name.required':'Nome obrigatório!',
      'surname.required':'Sobrenome obrigatório!',
      'email.required':'Email obrigatório!',
      'email.email':'Email inválido!',
      'email.unique':'Email já cadastrado!',
      'password.required':'Senha obrigatória!',
      'password.confirmed':'As senhas não correspondem!',
    }
  }
}

module.exports = Login;
