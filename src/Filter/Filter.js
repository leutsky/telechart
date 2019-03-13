import { createEl, addClass, removeClass } from '../utils';

import styles from './Filter.scss';

function checkboxTpl(id, item) {
  const input = `<input class="${styles.input}" name="${id}" type="checkbox" ${item.visible ? 'checked' : ''}>`;
  const icon = `<div class="${styles.icon}" style="color:${item.color}"></div>`;

  return `<label class="${styles.checkbox}">${input}${icon}${item.name}</label>`;
}

export default class Filter {
  constructor(dataset, onChange, themeName) {
    this.themeName = themeName;
    this.dataset = dataset;
    this.$el = createEl('div', `${styles.filter} ${styles[themeName]}`);
    this.render();

    this.$el.addEventListener('change', ({ target: { name, checked } }) => onChange(name, checked));
  }

  setTheme(themeName) {
    removeClass(this.$el, styles[this.themeName]);
    addClass(this.$el, styles[themeName]);

    this.themeName = themeName;
  }

  render() {
    const { data, order } = this.dataset;

    this.$el.innerHTML = order.reduce((html, id) => html + checkboxTpl(id, data[id]), '');
  }
}
