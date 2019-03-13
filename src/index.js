import Chart from './Chart';
import { createEl, addClass, removeClass } from './utils';

import sourceData from './chart_data.json';

let currentTheme = 'light';
const $layout = document.getElementById('layout');
const $switcher = document.getElementById('switcher');
const charts = [];

// init all charts
sourceData.forEach((dataset, idx) => {
  const $container = createEl('div', 'chartContainer');

  $layout.appendChild($container);

  const chart = new Chart($container, `Followers #${idx + 1}`, dataset, currentTheme);

  charts.push(chart);
});


// toggle themes
$switcher.addEventListener('click', () => {
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

  removeClass(document.body, currentTheme);
  addClass(document.body, nextTheme);

  currentTheme = nextTheme;

  charts.forEach((chart) => {
    chart.setTheme(currentTheme);
  });
});


// on resize
window.addEventListener('resize', () => {
  charts.forEach((chart) => {
    chart.update(currentTheme);
  });
});
