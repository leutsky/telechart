import { FIRST_INDEX } from './constants';
import { calcYTicks, getMinMax, makeTransition } from './utils';

/* eslint-disable no-underscore-dangle */
export default class YAxis {
  constructor(stick) {
    this.color = null;
    this.visible = false;
    this.stick = stick; // right
    this.dataIds = [];
    this.totalStacked = [null];
    this.percentage = false;

    // draw scale
    this.opacity = 1;
    this.scale = 0;

    // visible scale
    this.ticks = null;
    this.transitions = [];

    this.preview = {
      scale: 0,
      ticks: null,
      visible: true,
      transitions: [],
    };
  }

  _updateScale(context, startIndex, endIndex, dataById, ts) {
    const { dataIds } = this;
    let isVisible = false;
    let hasStacked = false;
    let mm = { min: Infinity, max: -Infinity };

    for (let i = 0; i < dataIds.length; i += 1) {
      const data = dataById[dataIds[i]];

      if (data.visible) {
        if (!data.stacked || (data.stacked && !hasStacked)) {
          mm = getMinMax(data.column, startIndex, endIndex, mm);
        }

        isVisible = true;
        hasStacked = hasStacked || data.stacked;
      }
    }

    if (hasStacked) {
      mm.min = 0;
      mm = getMinMax(this.totalStacked, startIndex, endIndex, mm);
    }

    /* eslint-disable no-param-reassign */
    context.visible = isVisible;

    if (!isVisible) {
      // TODO: добавить анимацию затухания
      return;
    }

    const { ticks } = context;

    if (this.percentage) {
      const nextTicks = {
        min: 0,
        max: 120,
        step: 20,
      };

      const nextScale = 120 / mm.max;

      // TODO: delete
      if (!ticks || nextScale !== context.scale) {
        context.ticks = nextTicks;
        context.scale = nextScale;
      }

      return;
    }

    const nextTicks = calcYTicks(mm.min, mm.max);

    if (!ticks || ticks.min !== nextTicks.min || ticks.max !== nextTicks.max) {
      context.ticks = nextTicks;

      const nextScale = 1 / (nextTicks.max - nextTicks.min);

      if (ticks) {
        context.opacity = 0;
        makeTransition(context, 'opacity', ts, 200, 1);
        makeTransition(context, 'scale', ts, 200, nextScale);
      } else {
        context.scale = nextScale;
      }
    }

    /* eslint-enable no-param-reassign */
  }

  updateScale(startIndex, endIndex, dataById, ts) {
    this._updateScale(this, startIndex, endIndex, dataById, ts);
  }

  updatePreview(startIndex, endIndex, dataById, ts) {
    this._updateScale(this.preview, startIndex, endIndex, dataById, ts);
  }

  updateTotalStacked(dataById) {
    const { dataIds, totalStacked } = this;
    let visibleCount = 0;

    for (let i = 0; i < dataIds.length; i += 1) {
      const data = dataById[dataIds[i]];

      if (data.visible && data.stacked) {
        const { column } = data;

        if (visibleCount === 0) {
          for (let j = FIRST_INDEX; j < column.length; j += 1) {
            totalStacked[j] = column[j];
          }
        } else {
          for (let j = FIRST_INDEX; j < column.length; j += 1) {
            totalStacked[j] += column[j];
          }
        }

        visibleCount += 1;
      }
    }
  }
}
