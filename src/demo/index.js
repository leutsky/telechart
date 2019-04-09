import {
  createEl, addClass, removeClass, rAF,
} from '../utils';

import './styles.scss';
import sourceData from './data/chart_data.json';
import sourceData1 from './data/overview-1.json';
import sourceData2 from './data/overview-2.json';
import sourceData3 from './data/overview-3.json';
import sourceData4 from './data/overview-4.json';
import sourceData5 from './data/overview-5.json';

const $layout = document.getElementById('layout');

const charts = [];

[
  {
    name: 'Followers',
    dataset: sourceData1,
  },
  {
    name: 'Interactions',
    dataset: sourceData2,
  },
  {
    name: 'Fruits',
    dataset: sourceData3,
  },
  {
    name: 'Views',
    dataset: sourceData4,
  },
  {
    name: 'Fruits',
    dataset: sourceData5,
  },
  {
    name: 'Stacked Y Axes',
    dataset: sourceData[4],
  },
  {
    name: 'Combination of chart types #1',
    dataset: sourceData[0],
  },
  {
    name: 'Combination of chart types #2',
    dataset: sourceData[1],
  },
].forEach((item, index) => {
  if (index === 5) {
    const $divider = createEl('div', 'divider');
    $divider.innerText = 'Some possibilities';
    $layout.appendChild($divider);
  }

  const $container = createEl('div', 'chartContainer');
  $layout.appendChild($container);

  charts.push(new Chart($container, item.name, item.dataset, 'day'));
});

/* Theme switcher */
const themeSwitcher = document.getElementById('switcher');
const themeSwitcherText = {
  themeDay: 'Switch to Night Mode',
  themeNight: 'Switch to Day Mode',
};
let currentTheme = 'themeDay';

themeSwitcher.innerText = themeSwitcherText[currentTheme];

themeSwitcher.addEventListener('click', () => {
  removeClass(document.body, currentTheme);
  currentTheme = currentTheme === 'themeDay' ? 'themeNight' : 'themeDay';
  charts.forEach(chart => chart.setTheme(currentTheme === 'themeDay' ? 'day' : 'night'));
  themeSwitcher.innerText = themeSwitcherText[currentTheme];
  addClass(document.body, currentTheme);
});

window.addEventListener('resize', () => {
  rAF(() => {
    charts.forEach(chart => chart.update());
  });
});
