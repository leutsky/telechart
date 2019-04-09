import {
  FIRST_INDEX,
  X_LABEL_DATE_WIDTH,
  X_LABEL_TIME_WIDTH,
  X_TYPE_DATE,
} from './constants';
import {
  formatDMn,
  formatHHMM,
  calcXTickStep,
  correctXStartIndex,
  clearTransitions,
  makeTransition,
} from './utils';

export default class XAxis {
  constructor(column, type) {
    const dates = [];
    const labels = [];

    for (let i = FIRST_INDEX; i < column.length; i += 1) {
      dates[i] = new Date(column[i]);
    }

    this.dataSize = column.length - FIRST_INDEX;
    this.type = type;
    this.column = column;
    this.dates = dates;
    this.labels = labels;

    this.tickWidth = null;
    this.tickStep = null;
    this.indexStep = null;
    this.opacityStep = null;

    this.offset = 0;
    this.scale = 0;

    this.opacity = 0;
    this.transitions = [];

    this.preview = {
      offset: 0,
      scale: 0,
    };
  }

  prepare(width) {
    const lastIndex = this.dataSize - 1;
    const labelWidth = this.type === X_TYPE_DATE ? X_LABEL_DATE_WIDTH : X_LABEL_TIME_WIDTH;
    this.tickWidth = labelWidth / width;
    this.anchorIndex = Math.round(lastIndex * (1 - this.tickWidth / 2)) + FIRST_INDEX;
  }

  getLabel(index) {
    return formatDMn(this.dates[index]);
  }

  getOpacity(index) {
    return 1;
  }

  updateScale(range, baseWidth, ts) {
    const rangeWidth = range[1] - range[0];
    const nextScale = baseWidth / ((this.dataSize - 1) * rangeWidth);
    const nextOffset = -(baseWidth * range[0] / rangeWidth + FIRST_INDEX * nextScale);
    const nextTickStep = calcXTickStep(nextScale, this.tickWidth);
    const offsetIndex = this.anchorIndex % nextTickStep;
    let nextStartIndex = Math.round((this.dataSize - 1) * range[0]) + FIRST_INDEX;
    nextStartIndex -= ((nextStartIndex - offsetIndex) % nextTickStep);
    nextStartIndex = correctXStartIndex(nextStartIndex, nextTickStep);

    const { tickStep } = this;
    let { indexStep, opacity, opacityStep } = this;

    if (!tickStep) {
      clearTransitions(this);

      opacity = 1;
      indexStep = nextTickStep;
      opacityStep = nextTickStep;
    } else if (tickStep !== nextTickStep) {
      if (nextTickStep > tickStep) {
        opacity = 1; // startIndex !== nextStartIndex ? 0 : 1;
        indexStep = Math.max(1, nextTickStep / 2);
        opacityStep = nextTickStep;
      } else {
        opacity = 0;
        indexStep = nextTickStep;
        opacityStep = nextTickStep * 2;
      }

      if (ts) {
        clearTransitions(this);
        makeTransition(this, 'opacity', ts, 200, 1 - opacity);
      } else {
        opacity = 1 - opacity;
      }
    }

    this.offsetIndex = offsetIndex;
    this.startIndex = nextStartIndex;

    this.tickStep = nextTickStep;
    this.indexStep = indexStep;

    this.opacity = opacity;
    this.opacityStep = opacityStep;

    this.offset = nextOffset;
    this.scale = nextScale;

    this.preview.scale = baseWidth / (this.dataSize - 1);
    this.preview.offset = -FIRST_INDEX * this.preview.scale;

    this.init = false;
  }
}
