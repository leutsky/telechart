import {
  createEl, addClass, removeClass,
  onEvent, offEvent, getPageX,
  bindObjectMethods, createViewport, getContext, rAF,
} from '../utils';

import styles from './Scroll.scss';

const hands = {
  [styles.leftHand]: true,
  [styles.rightHand]: true,
  [styles.centerHand]: true,
};
const sideSliderWidth = 15;

export default class Scroll {
  constructor(range, minRange, onChange) {
    this.themeName = null;
    this.range = range;
    this.minRange = minRange;
    this.state = { left: 0, right: 0 };
    this.visible = true;

    this.activeControl = null;
    this.prevPageX = null;
    this.onChange = onChange;

    this.initDom();

    bindObjectMethods(this, ['handleMove', 'handleMoveEnd', 'handleMoveStart']);

    onEvent(this.$el, 'mousedown,touchstart', this.handleMoveStart);
  }

  initDom() {
    this.$el = createEl('div', styles.scroll);
    this.$canvas = createEl('canvas', styles.canvas);
    this.$leftCover = createEl('div', styles.cover);
    this.$rightCover = createEl('div', styles.cover);
    this.$slider = createEl('div', styles.slider);
    this.$slider.innerHTML = `<div class="${styles.leftHand}"></div><div class="${styles.rightHand}"></div><div class="${styles.centerHand}"></div>`;

    this.$el.appendChild(this.$canvas);
    this.$el.appendChild(this.$leftCover);
    this.$el.appendChild(this.$rightCover);
    this.$el.appendChild(this.$slider);
  }

  destroy() {
    this.activeControl = null;
    this.detachMoveEvents();
    offEvent(window, 'mousedown,touchstart', this.handleMoveStart);
  }

  update() {
    const { offsetHeight, offsetTop, offsetWidth } = this.$el;

    this.vp = createViewport(0, offsetTop, offsetWidth, offsetHeight);
    this.width = this.vp.width - 2 * sideSliderWidth;
    this.leftMin = sideSliderWidth;
    this.rightMax = this.width + sideSliderWidth;
    this.updateState();
    this.redrawControls();
  }

  updateState() {
    this.state.left = Math.round(this.range[0] * this.width) + sideSliderWidth;
    this.state.right = Math.round(this.range[1] * this.width) + sideSliderWidth;
    this.state.minWidth = Math.round(this.minRange * this.width);
  }

  updateRange() {
    this.range[0] = (this.state.left - sideSliderWidth) / this.width;
    this.range[1] = (this.state.right - sideSliderWidth) / this.width;
  }

  setTheme(themeName) {
    if (this.themeName) {
      removeClass(this.$el, styles[this.themeName]);
    }

    addClass(this.$el, styles[themeName]);
    this.themeName = themeName;
  }

  setRange(range) {
    this.range = range;
    this.updateState();
  }

  attachMoveEvents() {
    onEvent(window, 'mousemove,touchmove', this.handleMove);
    onEvent(window, 'mouseup,touchend,touchcancel', this.handleMoveEnd);
  }

  detachMoveEvents() {
    offEvent(window, 'mousemove,touchmove', this.handleMove);
    offEvent(window, 'mouseup,touchend,touchcancel', this.handleMoveEnd);
  }

  handleMoveStart(event) {
    const { className } = event.target;

    if (hands[className]) {
      this.activeControl = className;
      this.prevPageX = getPageX(event);
      this.attachMoveEvents();
    }
  }

  handleMove(event) {
    const delta = getPageX(event) - this.prevPageX;

    if (delta) {
      const appliedDelta = this.applyDelta(delta);

      if (appliedDelta) {
        this.prevPageX += appliedDelta;
        this.updateRange();
        this.onChange(this.range);
        rAF(() => this.redrawControls());
      }
    }
  }

  handleMoveEnd() {
    this.activeControl = null;
    this.detachMoveEvents();
  }

  applyDelta(delta) {
    const { left, right, minWidth } = this.state;
    const width = right - left;
    let appliedDelta = delta;
    let nextLeft = left;
    let nextRight = right;

    if (this.activeControl === styles.leftHand) {
      nextLeft += delta;

      if (nextLeft > right - minWidth) {
        nextLeft = right - minWidth;
      } else if (nextLeft < this.leftMin) {
        nextLeft = this.leftMin;
      }

      appliedDelta = nextLeft - left;
    } else if (this.activeControl === styles.rightHand) {
      nextRight += delta;

      if (nextRight < left + minWidth) {
        nextRight = left + minWidth;
      } else if (nextRight > this.rightMax) {
        nextRight = this.rightMax;
      }

      appliedDelta = nextRight - right;
    } else if (this.activeControl === styles.centerHand) {
      nextLeft += delta;
      nextRight += delta;

      if (nextRight > this.rightMax) {
        nextRight = this.rightMax;
        nextLeft = nextRight - width;
      } else if (nextLeft < this.leftMin) {
        nextLeft = this.leftMin;
        nextRight = nextLeft + width;
      }

      appliedDelta = nextLeft - left;
    }

    this.state.left = nextLeft;
    this.state.right = nextRight;

    return appliedDelta;
  }

  redrawControls() {
    const { $slider, $leftCover, $rightCover, width } = this;
    const { left, right } = this.state;

    $slider.style.cssText = `left:${left - sideSliderWidth}px; right: ${width - right + sideSliderWidth}px`;
    $leftCover.style.right = `${width - left + 2 * sideSliderWidth}px`;
    $rightCover.style.left = `${right}px`;
  }
}
