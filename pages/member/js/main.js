var Parse = window.Parse;

customElements.define(
  'main-app',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('main-template');
      const templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
      if (!Parse.User.current()) {
        window.location = 'login.html';
        return;
      }
      // prevent flicker
      window.addEventListener(
        'load',
        () => {
          const loggedInUser = Parse.User.current();
          const userRef = this.shadowRoot.querySelector('#loggedInUser');
          userRef.setAttribute("href", "mailto:" + loggedInUser.get('email'));
          userRef.textContent = loggedInUser.get("name");

          this.shadowRoot
            .querySelector('#wrapper')
            .setAttribute('style', 'display: block;');
        },
        false
      );
    }
  }
);
