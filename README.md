## For Telegram Contest

**The Chart** is software for showing simple charts. Based on canvas. 
Supports web and mobile.

```javascript
import Chart from './src/Chart';

const container = document.getElementById('chart-container');
const chartHeader = 'Followers';
const bigData = {...};
const themeName = 'light'; // light or dark

const chart = new Chart(container, chartHeader, bigData, themeName);

...

// change theme
chart.setTheme('dark');

...

// change header
chart.setHeader('Canvas chart');

...

// force update. (on resize, for example)
chart.update();

...

// on destroy
chart.destroy();

```
