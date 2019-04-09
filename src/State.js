import XAxis from './XAxis';
import YAxis from './YAxis';

import {
  FIRST_INDEX,
  CHART_TYPE_X,
  CHART_TYPE_LINE,
  X_TYPE_DATE,
  Y_STICK_LEFT,
  Y_STICK_RIGHT,
} from './constants';
import {
  makeTransition, applyTransitions,
  prepareData,
} from './utils';

export default class State {
  constructor(dataset) {
    this.baseWidth = 1;
    this.firstIndex = FIRST_INDEX;
    this.lastIndex = null;
    this.range = [0, 1];
    this.ts = null;
    this.haveTransitions = false;

    this.prepareDataset(dataset);
  }

  setRange(range, updatePreview) {
    const { firstIndex, dataSize } = this;
    this.range = range;
    this.updateXAxis();

    const intervals = dataSize - 1;
    const startIndex = Math.floor(intervals * range[0]) + firstIndex;
    const endIndex = Math.ceil(intervals * range[1]) + firstIndex;

    if (this.startIndex !== startIndex || this.endIndex !== endIndex) {
      this.startIndex = startIndex;
      this.endIndex = endIndex;
      this.updateYAxes(updatePreview);
      this.haveTransitions = true;
    }
  }

  setVisible(id, visible) {
    const { dataById } = this;
    const dataItem = dataById[id];

    if (dataItem.visible !== visible) {
      dataItem.visible = visible;
      if (dataItem.type === CHART_TYPE_LINE || !dataItem.stacked) {
        makeTransition(dataItem, 'opacity', this.ts, 200, visible ? 1 : 0);
      }

      if (dataItem.stacked && !dataItem.yAxis.percentage) {
        makeTransition(dataItem, 'power', this.ts, 200, visible ? 1 : 0);
      }

      this.haveTransitions = true;
      this.updateYAxes(true);
    }
  }

  tick() {
    const { data, yAxes, xAxis, ts } = this;
    let remainTransitions = 0;

    for (let i = 0; i < data.length; i += 1) {
      remainTransitions += applyTransitions(data[i], ts);
    }

    for (let i = 0; i < yAxes.length; i += 1) {
      const yAxis = yAxes[i];

      remainTransitions += applyTransitions(yAxis, ts);
      remainTransitions += applyTransitions(yAxis.preview, ts);
    }

    remainTransitions += applyTransitions(xAxis, ts);

    this.haveTransitions = Boolean(remainTransitions);
  }

  prepareDataset(dataset) {
    const data = [];
    const dataById = {};
    const yAxes = [];
    let xAxis;
    const stacked = Boolean(dataset.stacked);

    yAxes[0] = new YAxis(Y_STICK_LEFT);
    if (dataset.y_scaled) {
      for (let o = 1; o < dataset.columns.length; o += 1) {
        yAxes[o] = new YAxis(o % 2 ? Y_STICK_RIGHT : Y_STICK_LEFT);
      }
    }

    let yAxisIdx = 0;

    dataset.columns.forEach((column) => {
      const id = column[0];
      const type = dataset.types[id];

      if (type === CHART_TYPE_X) {
        xAxis = new XAxis(column, X_TYPE_DATE);
      } else {
        const dataItem = prepareData(id, column, type, dataset);

        data.push(dataItem);
        dataById[id] = dataItem;
        yAxes[yAxisIdx].dataIds.push(id);

        dataItem.stacked = stacked;
        dataItem.groupId = yAxisIdx;
        dataItem.yAxis = yAxes[yAxisIdx];

        if (dataset.y_scaled) {
          yAxes[yAxisIdx].color = dataItem.color;
          yAxisIdx += 1;
        }
      }
    });

    if (dataset.percentage) {
      yAxes.forEach((yAxis) => {
        yAxis.percentage = true; // eslint-disable-line
      });
    }

    if (dataset.stacked) {
      yAxes.forEach(yAxis => yAxis.updateTotalStacked(dataById));
    }

    this.lastIndex = xAxis.column.length - FIRST_INDEX;
    this.dataset = dataset;
    this.data = data;
    this.dataById = dataById;
    this.yAxes = yAxes;
    this.xAxis = xAxis;

    this.dataSize = xAxis.column.length - this.firstIndex;
  }

  prepareXAxis(width) {
    this.xAxis.prepare(width);
    this.updateXAxis(true);
  }

  updateXAxis(forceUpdate) {
    this.xAxis.updateScale(this.range, this.baseWidth, this.ts, forceUpdate);
  }

  updateYAxes(updatePreview) {
    const {
      dataById, yAxes,
      firstIndex, startIndex, endIndex, lastIndex,
    } = this;

    for (let i = 0; i < yAxes.length; i += 1) {
      yAxes[i].updateTotalStacked(dataById);
      yAxes[i].updateScale(startIndex, endIndex, dataById, this.ts);

      if (updatePreview) {
        yAxes[i].updatePreview(firstIndex, lastIndex, dataById, this.ts);
      }
    }
  }
}
