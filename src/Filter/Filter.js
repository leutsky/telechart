import { createEl, addClass, removeClass } from '../utils';

import styles from './Filter.scss';

function checkboxTpl(item) {
  const input = `<input class="${styles.input}" name="${item.id}" type="checkbox" ${item.visible ? 'checked' : ''}>`;
  const icon = `<div class="${styles.icon}"></div>`;
  const name = `<div class="${styles.label}">${item.name}</div>`

  return `<label class="${styles.checkbox}" style="color:${item.color}">${input}${icon}${name}</label>`;
}

export default class Filter {
  constructor(state, onChange) {
    this.themeName = null;
    this.state = state;
    this.$el = createEl('div', styles.filter);
    this.render();

    this.$el.addEventListener('change', ({ target: { name, checked } }) => onChange(name, checked));
  }

  setTheme(themeName) {
    if (this.themeName) {
      removeClass(this.$el, styles[this.themeName]);
    }

    addClass(this.$el, styles[themeName]);
    this.themeName = themeName;
  }

  render() {
    const { data } = this.state;

    if (data.length > 1) {
      this.$el.innerHTML = data.reduce((html, item) => html + checkboxTpl(item), '');
    }
  }
}
