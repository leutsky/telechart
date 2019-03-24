import {
  drawScroll,
} from '../drawing';
import {
  addClass, removeClass,
  showEl,
  hideEl,
  createEl,
  onEvent,
  offEvent,
  getPageX,
  bindObjectMethods, createViewport,
} from '../utils';

import styles from './Scroll.scss';

const hands = {
  [styles.leftHand]: true,
  [styles.rightHand]: true,
  [styles.centerHand]: true,
};
const sideSliderWidth = 6;

function scrollTpl() {
  const $el = createEl('div', styles.scroll);
  const $leftHand = createEl('div', styles.leftHand);
  const $rightHand = createEl('div', styles.rightHand);
  const $centerHand = createEl('div', styles.centerHand);

  $el.appendChild($leftHand);
  $el.appendChild($rightHand);
  $el.appendChild($centerHand);

  return {
    $el,
    $leftHand,
    $rightHand,
    $centerHand,
  };
}

export default class Scroll {
  constructor(ctx, range, minRange, onChange) {
    this.ctx = ctx;

    Object.assign(this, scrollTpl());

    this.range = range;
    this.minRange = minRange;
    this.state = { left: 0, right: 0 };

    this.activeControl = null;
    this.prevPageX = null;
    this.onChange = onChange;

    bindObjectMethods(this, ['handleMove', 'handleMoveEnd', 'handleMoveStart']);

    onEvent(this.$el, 'mousedown,touchstart', this.handleMoveStart);
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
    this.redrawSlider();
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
      hideEl(this.$el);
      addClass(this.$el.parentNode, styles.cursorGrabbing);
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
      }
    }
  }

  handleMoveEnd() {
    this.activeControl = null;
    this.detachMoveEvents();
    this.redrawControls();
    showEl(this.$el);
    removeClass(this.$el.parentNode, styles.cursorGrabbing);
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

  redrawSlider() {
    drawScroll(this.ctx, this.state, sideSliderWidth, this.vp, this.theme);
  }

  redrawControls() {
    const { left, right } = this.state;

    this.$leftHand.style.left = `${left - sideSliderWidth}px`;
    this.$rightHand.style.left = `${right}px`;
    this.$centerHand.style.left = `${left}px`;
    this.$centerHand.style.width = `${right - left}px`;
  }
}
