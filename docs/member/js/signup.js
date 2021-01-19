customElements.define(
  'signup-form',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('signup-template');
      const templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
      const form = this.shadowRoot.querySelector('form');
      form.addEventListener('submit', this.onSubmit.bind(this), false);
    }

    onSubmit(e) {
      e.preventDefault();
      const name = this.shadowRoot.querySelector('#inputName').value;
      const phone = this.shadowRoot.querySelector('#inputPhone').value;
      const email = this.shadowRoot.querySelector('#inputEmail').value;
      const password = this.shadowRoot.querySelector('#inputPassword').value;
      const confirmPassword = this.shadowRoot.querySelector(
        '#inputPasswordConfirm'
      ).value;

      if (password !== confirmPassword) {
        alert("密码不匹配！");
      } else if (password.length < 6) {
        alert('密码至少6个字符！');
      } else {
        this.signup(name, email, password, phone)
        .then(() => {
          alert('用户注册成功！请确认您的电邮地址，再来登录');
          window.location.href = 'login.html';
        })
        .catch(e => {
          alert("用户注册失败！"+ e.message);
        });
      }
    }

    signup(name, email, password, phone) {
      return Parse.Cloud.run('user:signup', {
        name,
        email,
        password,
        phone
      });
    }
  }
);
