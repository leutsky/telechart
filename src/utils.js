const TYPE_X = 'x';
// const DATE_OPTIONS = {
//   day: 'numeric',
//   month: 'short',
// };
const FIRST_INDEX = 1;
const X_LABEL_WIDTH = 80;

const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function prepareXAxisData(id, column) {
  const dates = new Array(column.length);
  const labels = new Array(column.length);

  for (let i = FIRST_INDEX; i < column.length; i += 1) {
    const date = new Date(column[i]);

    dates[i] = date;
    // labels[i] = (date.toLocaleDateString('hc', DATE_OPTIONS));
    labels[i] = formatDate(date);
  }

  return {
    id,
    type: TYPE_X,
    column,
    dates,
    labels,
  };
}

function prepareMinMax(column) {
  const indexMin = new Array(column.length);
  const indexMax = new Array(column.length);
  let minValue = column[FIRST_INDEX];
  let maxValue = column[FIRST_INDEX];

  for (let idx = FIRST_INDEX; idx < column.length; idx += 1) {
    const val = column[idx];

    minValue = Math.min(minValue, val);
    maxValue = Math.max(maxValue, val);

    for (let i = idx + 1; i < column.length; i += 1) {
      if (!indexMax[idx] && val < column[i]) {
        indexMax[idx] = i;
      }

      if (!indexMin[idx] && val > column[i]) {
        indexMin[idx] = i;
      }

      if (indexMax[idx] && indexMin[idx]) {
        break;
      }
    }
  }

  return {
    indexMax,
    indexMin,
    maxValue,
    minValue,
  };
}

export function prepareDataset(source) {
  const result = {
    data: {},
    length: 0,
    firstIndex: FIRST_INDEX,
    lastIndex: 0,
    order: [],
    x: null,
  };

  if (!Array.isArray(source.columns)) {
    return null;
  }

  source.columns.forEach((sourceColumn) => {
    const id = sourceColumn[0];
    const column = sourceColumn;
    const type = source.types[id];

    if (type === TYPE_X) {
      result.x = prepareXAxisData(id, column);
    } else {
      result.order.push(id);
      result.data[id] = {
        id,
        column,
        type: source.types[id],
        name: source.names[id],
        color: source.colors[id],
        visible: true,
        ...prepareMinMax(column),
      };
    }
  });

  result.length = result.x.column.length;
  result.lastIndex = result.length - 1;

  return result;
}

function getExtremum(data, indexes, startIndex, endIndex) {
  let i = startIndex;

  while (indexes[i] && indexes[i] <= endIndex) {
    i = indexes[i];
  }

  return data[i];
}

export function getDatasetMinMax(dataset, startIndex, endIndex) {
  let max = -Infinity;
  let min = -max;

  dataset.order.forEach((id) => {
    const data = dataset.data[id];

    if (!data.visible) {
      return;
    }

    max = Math.max(max, getExtremum(data.column, data.indexMax, startIndex, endIndex));
    min = Math.min(min, getExtremum(data.column, data.indexMin, startIndex, endIndex));
  });

  return {
    max,
    min,
  };
}

function updateAxisY(stateAxisY, extr, ticks = 6) {
  const range = 1.025 * extr.max - extr.min;

  /* eslint-disable no-param-reassign */
  if (ticks < 2) {
    ticks = 2;
  } else if (ticks > 2) {
    ticks -= 1;
  }

  const tempStep = range / ticks;
  const mag = Math.floor(Math.log10(tempStep));
  const magPow = 10 ** mag;
  const magMsd = Math.floor(tempStep / magPow + 0.5);
  const step = magPow * magMsd;

  stateAxisY.min = step * Math.floor(extr.min / step);
  stateAxisY.max = step * Math.ceil(extr.max / step);
  stateAxisY.tickStep = step;
  /* eslint-enable no-param-reassign */
}

export function updateAxisX(stateAxisX, state) {
  const {
    firstIndex, lastIndex, startIndex, endIndex, stepX,
  } = state;
  const tmpStep = Math.round(X_LABEL_WIDTH / stepX);

  let tickStep = 1;
  while (tickStep < tmpStep) {
    tickStep *= 2;
  }

  const labelEndIndex = lastIndex - 7;

  let labelFirstIndex = labelEndIndex % tickStep;
  while (labelFirstIndex < firstIndex) {
    labelFirstIndex += tickStep;
  }

  let labelStartIndex = startIndex - ((startIndex - labelFirstIndex) % tickStep);
  if (labelStartIndex < firstIndex) {
    labelStartIndex += tickStep;
  }

  const nextEndIndex = endIndex - ((endIndex - labelFirstIndex) % tickStep);

  /* eslint-disable no-param-reassign */
  stateAxisX.startIndex = labelStartIndex;
  stateAxisX.endIndex = nextEndIndex;
  stateAxisX.tickStep = tickStep;
  /* eslint-enable no-param-reassign */
}

export function updateChartsState(dataset, state, range, vp) {
  const { firstIndex, lastIndex } = dataset;
  const realWidth = vp.width / (range[1] - range[0]);

  /* eslint-disable no-param-reassign */
  state.firstIndex = firstIndex;
  state.lastIndex = lastIndex;
  state.startIndex = Math.floor((lastIndex - firstIndex) * range[0]) + firstIndex;
  state.endIndex = Math.ceil(lastIndex * range[1]);

  updateAxisY(state.axisY, getDatasetMinMax(dataset, state.startIndex, state.endIndex));

  const { axisY } = state;

  state.stepX = realWidth / lastIndex;
  state.stepY = vp.height / (axisY.max - axisY.min);
  state.offsetX = -realWidth * range[0];
  state.offsetY = axisY.min * state.stepY;

  updateAxisX(state.axisX, state);
  /* eslint-enable no-param-reassign */
}

export const createViewport = (x, y, width, height, cx0 = 0, cy0 = 0, cx1 = 0, cy1 = 0) => ({
  x, y, width, height, cx0, cy0, cx1, cy1,
});

export function createEl(tagName, cls, attrs) {
  const el = document.createElement(tagName);

  if (cls) {
    el.className = cls;
  }

  if (typeof attrs === 'object') {
    // eslint-disable-next-line
    for (const attrName in attrs) {
      el.setAttribute(attrName, attrs[attrName]);
    }
  }

  return el;
}

export function getContext(canvas) {
  return canvas.getContext('2d');
}

export function getPixelRatio() {
  return window.devicePixelRatio || 1;
}

export function rAF(cb) {
  return window.requestAnimationFrame(cb);
}

export function cAF(requestId) {
  return window.cancelAnimationFrame(requestId);
}

export function hideEl(el) {
  // eslint-disable-next-line no-param-reassign
  el.style.display = 'none';
}

export function showEl(el) {
  // eslint-disable-next-line no-param-reassign
  el.style.display = null;
}

export function addClass(el, className) {
  // eslint-disable-next-line no-param-reassign
  el.className += ` ${className}`;
}

export function removeClass(el, className) {
  // eslint-disable-next-line no-param-reassign
  el.className = el.className.replace(className, '').replace(/\s/g, ' ').trim();
}

export function onEvent(el, eventNames, cb, options) {
  eventNames.split(',').forEach(name => el.addEventListener(name, cb, options));
}

export function offEvent(el, eventNames, cb) {
  eventNames.split(',').forEach(name => el.removeEventListener(name, cb));
}

export function getPageX(event) {
  return (event.touches ? event.touches[0] : event).pageX;
}

export function getOffsetX(event) {
  if (event.touches) {
    const touch = event.touches[0];
    const rect = touch.target.getBoundingClientRect();

    return touch.clientX - rect.left;
  } else {
    return event.offsetX;
  }
}

export function bindObjectMethods(object, methods) {
  methods.forEach((name) => {
    if (name in object) {
      // eslint-disable-next-line no-param-reassign
      object[name] = object[name].bind(object);
    }
  });
}

function formatDate(date) {
  return `${monthShortNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatDateDay(date) {
  return `${dayShortNames[date.getUTCDay()]}, ${formatDate(date)}`;
}
