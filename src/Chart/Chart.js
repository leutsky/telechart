import Filter from '../Filter';
import Scroll from '../Scroll';
import State from '../State';
import {
  X_AXIS_HEIGHT,
} from '../constants';
import {
  clearRect,
  drawCharts,
  drawCursor,
  drawXAxis,
  drawYAxes,
  getContext,
  getPixelRatio,
} from '../drawing';
import * as themes from './themes';
import {
  bindObjectMethods,
  createViewport,
  hasStatePercentage,
  createEl, addClass, removeClass,
  onEvent, offEvent,
  showEl, hideEl,
  formatDayDMnYYYY,
  formatDMonthYYYY,
  rAF, getOffsetX,
} from '../utils';

import styles from './Chart.scss';

function tableTpl(content) {
  return `<table class="${styles.table}"><tbody>${content}</tbody></table>`;
}

function tableRowTpl(name, value, color, percents, percentage) {
  let cells = '';

  if (percentage) {
    cells += `<td class="${styles.tdPercents}">${percents >> 0}%</td>`; // eslint-disable-line
  }

  cells += `<td class="${styles.tdName}">${name}</td>`;
  cells += `<td class="${styles.tdValue}" style="color: ${color};">${value}</td>`;

  return `<tr>${cells}</tr>`;
}

function bubbleTpl(state, index) {
  const { data, xAxis: { dates } } = state;
  const hasPercentage = hasStatePercentage(state);
  let items = '';

  const header = `<div class="${styles.bubbleDate}">${formatDayDMnYYYY(dates[index])}</div>`;

  data.forEach((dataItem) => {
    if (!dataItem.visible) {
      return;
    }

    const {
      color, column, name, yAxis,
    } = dataItem;
    const percents = yAxis.percentage ? (column[index] * 100 / yAxis.totalStacked[index]) : null;

    items += tableRowTpl(name, column[index], color, percents, hasPercentage);
  });

  const content = `<div class="${styles.bubbleContent}">${tableTpl(items)}</div>`;

  return `<div class="${styles.bubbleWrap}">${header}${content}</div>`;
}

export default class Chart {
  constructor(container, headerText, sourceData, theme) {
    this.theme = null;
    this.themeName = null;
    this.defaultRange = [0.75, 1];
    this.state = new State(sourceData);
    this.changes = {
      range: null,
      visible: null,
    };
    this.drawing = false;

    this.initDom(container);
    this.initScroll();
    this.initFilter();
    this.initContext();
    this.initCursor();

    bindObjectMethods(this, ['redraw']);

    this.setHeader(headerText);
    this.setTheme(theme);

    this.update();
  }

  initDom(container) {
    this.$el = createEl('div', styles.chartWrap);
    this.$header = createEl('div', styles.header);
    this.$range = createEl('div', styles.range);
    this.$charts = createEl('div', styles.charts);
    this.$chartsCanvas = createEl('canvas', styles.canvas);
    this.$deskCanvas = createEl('canvas', styles.canvas);
    this.$cursorZone = createEl('div', styles.cursorZone);
    this.$bubble = createEl('div', styles.bubble);
    hideEl(this.$bubble);

    this.$cursorZone.appendChild(this.$bubble);
    this.$charts.appendChild(this.$chartsCanvas);
    this.$charts.appendChild(this.$deskCanvas);
    this.$charts.appendChild(this.$cursorZone);
    this.$el.appendChild(this.$header);
    this.$el.appendChild(this.$range);
    this.$el.appendChild(this.$charts);

    container.appendChild(this.$el);
  }

  initContext() {
    this.chartsCtx = getContext(this.$chartsCanvas);
    this.deskCtx = getContext(this.$deskCanvas);
    this.previewCtx = getContext(this.scroll.$canvas);
  }

  initFilter() {
    this.filter = new Filter(this.state, (id, visible) => this.setVisible(id, visible));
    this.$el.appendChild(this.filter.$el);
  }

  initScroll() {
    this.scroll = new Scroll(this.defaultRange, 0.01, range => this.setRange(range));
    this.$el.appendChild(this.scroll.$el);
    this.scroll.update();
  }

  initCursor() {
    bindObjectMethods(this, ['handleCursorStart', 'handleCursorMove', 'handleCursorEnd']);
    this.showCursor = false;
    this.cursorIndex = null;
    onEvent(this.$cursorZone, 'mouseenter,touchstart', this.handleCursorStart);
  }

  update() {
    this.updateScene();
    this.state.prepareXAxis(this.vp.main.width);
    this.scroll.update();
    this.state.setRange(this.scroll.range, true);
    this.draw();
    this.drawPreview();
    this.updateRange();
  }

  updateScene() {
    const { $chartsCanvas, $deskCanvas, scroll: { $canvas: $previewCanvas } } = this;
    const { offsetHeight: mainHeight, offsetWidth: mainWidth } = $chartsCanvas;
    const { offsetHeight: previewHeight, offsetWidth: previewWidth } = $previewCanvas;
    const pixelRatio = getPixelRatio();

    /* eslint-disable no-param-reassign */
    [$chartsCanvas, $deskCanvas, $previewCanvas].forEach((canvas) => {
      canvas.height = canvas.offsetHeight * pixelRatio;
      canvas.width = canvas.offsetWidth * pixelRatio;
    });
    /* eslint-enable no-param-reassign */

    this.vp = {
      main: createViewport(0, 0, mainWidth, mainHeight),
      charts: createViewport(0, 0, mainWidth, mainHeight - X_AXIS_HEIGHT),
      preview: createViewport(0, 0, previewWidth, previewHeight),
    };
  }

  updateRange() {
    const { startIndex, endIndex, xAxis: { dates } } = this.state;

    this.$range.innerText = `${formatDMonthYYYY(dates[startIndex])} - ${formatDMonthYYYY(dates[endIndex])}`;
  }

  setHeader(text) {
    this.$header.innerText = text;
  }

  setTheme(themeName) {
    if (this.themeName !== themeName) {
      if (this.theme) {
        removeClass(this.$el, styles[this.themeName]);
      }

      addClass(this.$el, styles[themeName]);
      this.theme = themes[themeName];
      this.themeName = themeName;
      this.scroll.setTheme(themeName);
      this.filter.setTheme(themeName);
      this.update();
    }
  }

  setRange(range) {
    this.changes.range = range;
    this.scheduleChanges();
  }

  setVisible(id, visible) {
    this.changes.visible = { id, visible };
    this.scheduleChanges();
  }

  scheduleChanges() {
    if (!this.drawing) {
      this.drawing = true;

      rAF(this.redraw);
    }
  }

  redraw(ts) {
    const { changes, state } = this;

    state.ts = ts;
    state.tick();

    if (changes.range) {
      state.setRange(changes.range);
      changes.range = null;
    } else if (changes.visible) {
      state.setVisible(changes.visible.id, changes.visible.visible);
      changes.visible = null;
      this.drawPreview();
    } else {
      this.drawPreview();
    }

    this.updateRange();
    this.draw();

    if (state.haveTransitions) {
      rAF(this.redraw);
    } else {
      this.drawing = false;
    }
  }

  draw() {
    const { theme } = this;

    clearRect(this.chartsCtx, this.vp.main);
    drawCharts(this.chartsCtx, this.state, this.vp.charts, false, 3, theme);
    clearRect(this.deskCtx, this.vp.main);
    this.drawAxes();
  }

  drawPreview() {
    if (this.scroll.visible) {
      clearRect(this.previewCtx, this.vp.preview);
      drawCharts(this.previewCtx, this.state, this.vp.preview, true);
    }
  }

  drawAxes() {
    const { theme } = this;

    drawYAxes(this.deskCtx, this.state, this.vp.charts, theme);
    drawXAxis(this.deskCtx, this.state, this.vp.main, theme);
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

  moveCursor(x) {
    const {
      deskCtx, state, vp, theme,
    } = this;

    rAF(() => {
      const { xAxis } = state;
      let index = Math.round((x / vp.charts.width - xAxis.offset) / xAxis.scale);

      if (index < state.startIndex) {
        index = state.startIndex;
      } else if (index > state.endIndex) {
        index = state.endIndex;
      }

      if (this.cursorIndex !== index) {
        this.cursorIndex = index;
        this.renderBubble();
        clearRect(deskCtx, this.vp.main);
        drawCursor(deskCtx, state, index, vp.charts, theme);
        this.drawAxes();
      }
    });
  }

  hideCursor() {
    this.showCursor = false;
    this.cursorIndex = null;
    this.detachCursorEvents();
    hideEl(this.$bubble);

    rAF(() => {
      clearRect(this.deskCtx, this.vp.main);
      this.drawAxes();
    });
  }

  renderBubble() {
    const {
      $bubble, state, cursorIndex, vp,
    } = this;

    if (!this.showCursor) {
      return;
    }
    showEl($bubble);

    const { xAxis } = state;

    $bubble.innerHTML = bubbleTpl(state, cursorIndex);

    const bubbleWidth = $bubble.offsetWidth;

    const stepX = xAxis.scale * vp.main.width;
    const offsetX = xAxis.offset * vp.main.width;
    const cursorX = Math.round(cursorIndex * stepX + offsetX);

    let bubbleX = cursorX - bubbleWidth - 20;

    if (bubbleX < 20) {
      bubbleX = cursorX + 20;
    }

    $bubble.style.left = `${bubbleX}px`;
  }
  // end: Cursor
}
