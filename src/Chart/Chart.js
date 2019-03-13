import Filter from '../Filter';
import Scroll from '../Scroll';
import {
  clearRect,
  drawGrid,
  drawCharts,
  drawCursor,
  drawXLabels,
  drawYLabels,
} from '../drawing';
import {
  bindObjectMethods,
  createEl, createViewport,
  formatDateDay,
  getContext,
  getOffsetX,
  getPixelRatio,
  offEvent, onEvent,
  prepareDataset,
  showEl, hideEl,
  addClass, removeClass,
  rAF,
  updateChartsState,
} from '../utils';

import styles from './Chart.scss';

import * as themes from './themes';

function chartTpl(theme) {
  const $el = createEl('div', `${styles.chartWrap} ${styles[theme]}`);
  const $header = createEl('div', styles.header);
  const $charts = createEl('div', styles.charts);
  const $chartsCanvas = createEl('canvas', styles.canvas);
  const $deskCanvas = createEl('canvas', styles.canvas);
  const $cursorZone = createEl('div', styles.cursorZone);
  const $bubble = createEl('div', styles.bubble);
  const $noData = createEl('div', styles.noData);
  $noData.innerText = 'No data to view';
  hideEl($bubble);
  hideEl($noData);

  $cursorZone.appendChild($bubble);
  $charts.appendChild($chartsCanvas);
  $charts.appendChild($deskCanvas);
  $charts.appendChild($cursorZone);
  $charts.appendChild($noData);
  $el.appendChild($header);
  $el.appendChild($charts);

  return {
    $el, $header, $charts, $chartsCanvas, $deskCanvas, $cursorZone, $bubble, $noData,
  };
}

function bubbleTpl(dataset, index) {
  const header = `<div class="${styles.bubbleDate}">${formatDateDay(dataset.x.dates[index])}</div>`;
  let items = '';

  dataset.order.forEach((id) => {
    const data = dataset.data[id];

    items += `<div class="${styles.bubbleItem}" style="color: ${data.color};"><div class="${styles.bubbleVal}">${data.column[index]}</div>${data.name}</div>`;
  });

  const content = `<div class="${styles.bubbleContent}">${items}</div>`;

  return `<div class="${styles.bubbleWrap}">${header}${content}</div>`;
}

export default class Chart {
  constructor(container, headerText, sourceData, themeName) {
    bindObjectMethods(this, ['handleFilterChange', 'handleScrollChange']);

    this.themeName = themeName;
    this.theme = themes[themeName];
    this.dataset = prepareDataset(sourceData);
    this.state = {
      axisY: {},
      axisX: {},
    };
    this.previewState = {
      axisY: {},
      axisX: {},
    };

    // init: DOM model
    Object.assign(this, chartTpl(themeName));
    container.appendChild(this.$el);

    // prepare: Contexts
    this.chartsCtx = getContext(this.$chartsCanvas);
    this.deskCtx = getContext(this.$deskCanvas);

    this.$header.innerText = headerText;

    // init: Scroll
    this.scroll = new Scroll(this.deskCtx, [0.75, 1], 0.01, this.handleScrollChange);
    this.scroll.theme = this.theme;
    this.$charts.appendChild(this.scroll.$el);

    // init: Filter
    this.filter = new Filter(this.dataset, this.handleFilterChange, themeName);
    this.$el.appendChild(this.filter.$el);

    // init: Cursor
    bindObjectMethods(this, ['handleCursorStart', 'handleCursorMove', 'handleCursorEnd']);
    this.showCursor = false;
    this.cursorIndex = null;
    onEvent(this.$cursorZone, 'mouseenter,touchstart', this.handleCursorStart);

    this.update();
    this.redrawPreview();
    this.redrawCharts();
  }

  destroy() {
    this.scroll.destroy();
    this.detachCursorEvents();
  }

  setTheme(themeName) {
    removeClass(this.$el, styles[this.themeName]);
    addClass(this.$el, styles[themeName]);

    this.theme = themes[themeName];
    this.themeName = themeName;
    this.scroll.theme = this.theme;
    this.filter.setTheme(themeName);

    this.update();
    this.redrawPreview();
    this.redrawCharts();
  }

  setHeader(name) {
    this.$header.innerText = name;
  }

  handleFilterChange(id, visible) {
    this.dataset.data[id].visible = visible;

    let canShow = false;
    this.dataset.order.forEach((id) => {
      canShow = canShow || this.dataset.data[id].visible;
    });

    if (canShow) {
      hideEl(this.$noData);
      this.redrawCharts();
      this.redrawPreview();
    } else {
      showEl(this.$noData);
    }
  }

  handleScrollChange() {
    this.redrawCharts();
  }

  // start: Cursor

  attachCursorEvents() {
    onEvent(this.$cursorZone, 'mousemove,touchmove', this.handleCursorMove);
    onEvent(this.$cursorZone, 'mouseleave,touchend,touchcancel', this.handleCursorEnd);
  }

  detachCursorEvents() {
    offEvent(this.$cursorZone, 'mousemove,touchmove', this.handleCursorMove);
    offEvent(this.$cursorZone, 'mouseleave,touchend,touchcancel', this.handleCursorEnd);
  }

  handleCursorStart(e) {
    this.showCursor = true;
    this.attachCursorEvents();
    this.moveCursor(getOffsetX(e));
  }

  handleCursorMove(e) {
    if (this.showCursor) {
      this.moveCursor(getOffsetX(e));
    } else {
      this.hideCursor();
    }
  }

  handleCursorEnd() {
    this.hideCursor();
  }

  // end: Cursor

  update() {
    this.updateScene();
    this.redrawCharts();
    this.redrawPreview();
  }

  updateScene() {
    const { offsetHeight: vpHeight, offsetWidth: vpWidth } = this.$chartsCanvas;
    const pixelRatio = getPixelRatio();

    /* eslint-disable no-param-reassign */
    [this.$chartsCanvas, this.$deskCanvas].forEach((canvas) => {
      canvas.height = vpHeight * pixelRatio;
      canvas.width = vpWidth * pixelRatio;
    });
    /* eslint-enable no-param-reassign */

    this.vp = {
      grid: createViewport(0, 0, vpWidth, 450),
      charts: createViewport(0, 0, vpWidth, 420, 0, 0, 0, 10),
      preview: createViewport(0, vpHeight - 55, vpWidth, 50, 0, 10, 0, 10),
    };

    this.scroll.update();
  }

  updateState() {
    updateChartsState(this.dataset, this.state, this.scroll.range, this.vp.charts);
  }

  updatePreviewState() {
    updateChartsState(this.dataset, this.previewState, [0, 1], this.vp.preview);
  }

  moveCursor(x) {
    const {
      deskCtx, dataset, state, vp, theme,
    } = this;

    rAF(() => {
      let index = Math.round((x - state.offsetX) / state.stepX);

      if (index < state.startIndex) {
        index = state.startIndex;
      } else if (index > state.endIndex) {
        index = state.endIndex;
      }

      if (this.cursorIndex !== index) {
        this.cursorIndex = index;
        this.redrawBubble();
        drawCursor(deskCtx, dataset, state, index, vp.charts, theme);
      }
    });
  }

  hideCursor() {
    const {
      deskCtx, vp,
    } = this;

    this.showCursor = false;
    this.cursorIndex = null;
    this.detachCursorEvents();
    hideEl(this.$bubble);

    rAF(() => {
      clearRect(deskCtx, vp.charts);
    });
  }

  redrawBubble() {
    const {
      $bubble, dataset, state, cursorIndex, vp,
    } = this;

    if (!this.showCursor) {
      return;
    }
    showEl($bubble);

    $bubble.innerHTML = bubbleTpl(dataset, cursorIndex);

    const bubbleWidth = $bubble.offsetWidth;
    const bubbleHalfWidth = Math.round(bubbleWidth / 2);
    const cursorX = Math.round(state.stepX * cursorIndex + state.offsetX);
    let bubbleX = cursorX - bubbleHalfWidth;

    if (bubbleX < 0) {
      bubbleX = 0;
    } else if (bubbleX > vp.charts.width - bubbleWidth) {
      bubbleX = vp.charts.width - bubbleWidth;
    }

    $bubble.style.left = `${bubbleX}px`;
  }

  redrawCharts() {
    const {
      chartsCtx, dataset, state, vp, theme,
    } = this;


    rAF((ts) => {
      this.updateState(ts);

      this.scroll.redrawSlider();
      clearRect(chartsCtx, vp.grid);
      drawGrid(chartsCtx, vp.grid, theme);
      drawCharts(chartsCtx, dataset, state, vp.charts, 3);
      drawYLabels(chartsCtx, state, vp.grid, theme);
      drawXLabels(chartsCtx, dataset.x.labels, state, vp.grid, theme);
    });
  }

  redrawPreview() {
    const {
      chartsCtx, dataset, previewState, vp,
    } = this;

    rAF((ts) => {
      const prevMin = previewState.min;
      const prevMax = previewState.max;

      this.updatePreviewState(ts);

      if (prevMax !== previewState.max || prevMin !== previewState.min) {

      }

      clearRect(chartsCtx, vp.preview);
      drawCharts(chartsCtx, dataset, previewState, vp.preview);
    });
  }
}
