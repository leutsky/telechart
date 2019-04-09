import {
  DAY_SHORT_NAMES,
  MONTH_SHORT_NAMES,
  MONTH_FULL_NAMES, FIRST_INDEX,
} from './constants';

export function hasStatePercentage(state) {
  let has = false;

  state.yAxes.forEach((axis) => {
    if (axis.visible) {
      has = has || axis.percentage;
    }
  });

  return has;
}

export function prepareData(id, column, type, dataset) {
  return {
    id,
    column,
    type,
    color: dataset.colors[id],
    name: dataset.names[id],
    visible: true,
    groupId: null,
    yAxis: null,
    stacked: false,
    opacity: 1,
    power: 1,
    transitions: [],
  };
}

export function makeTransition(obj, prop, ts, duration, endValue) {
  obj.transitions.push([prop, ts, duration, obj[prop], endValue]);
}

export function clearTransitions(obj) {
  obj.transitions.length = 0; // eslint-disable-line
}

const T_PROP = 0;
const T_START_TS = 1;
const T_DURATION = 2;
const T_START_VALUE = 3;
const T_END_VALUE = 4;

export function haveTransitions(obj) {
  return Boolean(obj.transitions.length);
}

export function hasTransition(obj, name) {
  if (haveTransitions(obj)) {
    for (let i = 0; i < obj.transitions.length; i += 1) {
      if (obj.transitions[i][T_PROP] === name) {
        return true;
      }
    }
  }

  return false;
}

export function applyTransitions(obj, currentTs) {
  if (!haveTransitions(obj)) {
    return 0;
  }

  const { transitions } = obj;
  let remindTransitions = transitions.length;

  for (let i = 0; i < transitions.length; i += 1) {
    const t = transitions[i];
    const startValue = t[T_START_VALUE];
    const endValue = t[T_END_VALUE];
    let nextValue = startValue + (currentTs - t[T_START_TS]) * (endValue - startValue) / t[T_DURATION];

    if ((startValue > endValue && nextValue <= endValue)
      || (startValue <= endValue && nextValue >= endValue)
    ) {
      nextValue = endValue;
      remindTransitions -= 1;
    }

    // eslint-disable-next-line
    obj[t[T_PROP]] = nextValue;
  }

  if (transitions.length && !remindTransitions) {
    // eslint-disable-next-line
    transitions.length = 0;
  }

  return remindTransitions;
}

export const log10 = Math.log10 || (x => Math.log(x) / Math.LN10);

export function getMinMax(column, startIndex, endIndex, mm) {
  /* eslint-disable no-param-reassign */
  let { min, max } = mm;

  for (let idx = startIndex; idx <= endIndex; idx += 1) {
    if (column[idx] > max) {
      max = column[idx];
    }

    if (column[idx] < min) {
      min = column[idx];
    }
  }
  /* eslint-enable no-param-reassign */

  return { min, max };
}

export function calcYTicks(min, max, ticks = 5) {
  const range = (max - min) * 0.75;

  const tempStep = range / ticks;
  const mag = Math.floor(log10(tempStep));
  const magPow = Math.pow(10, mag); // eslint-disable-line
  const magMsd = Math.floor(tempStep / magPow + 0.5);
  let step = magPow * magMsd;

  const nextMin = step * Math.floor(min / step);
  let nextMax = step * Math.ceil(max / step);
  let nextTicks = Math.round((nextMax - nextMin) / step);

  // TODO: проверить на маленьких числах
  if (nextTicks > ticks) {
    step = step < 10 ? step + 1 : Math.round(step * nextTicks / ticks);
    nextMax = nextMin + step * ticks;
  } else if (nextTicks < ticks) {
    nextMax = Math.round(step * ticks);
  }

  return {
    min: nextMin,
    max: nextMax,
    step,
  };
  /* eslint-enable no-param-reassign, no-restricted-properties */
}

export function calcXTickStep(scale, tickWidth) {
  const tmpStep = Math.round(tickWidth / scale);

  let tickStep = 1;
  while (tickStep < tmpStep) {
    tickStep *= 2;
  }

  return tickStep;
}

export function correctXStartIndex(startIndex, tickStep) {
  while (startIndex < FIRST_INDEX) {
    startIndex += tickStep; // eslint-disable-line
  }

  return startIndex;
}

export function formatHHMM(d) {
  return `${d.getUTCHours()}:${d.getUTCMinutes()}`;
}

export function formatDMn(d) {
  return `${d.getUTCDate()} ${MONTH_SHORT_NAMES[d.getUTCMonth()]}`;
}

export function formatDMonth(d) {
  return `${d.getUTCDate()} ${MONTH_FULL_NAMES[d.getUTCMonth()]}`;
}

export function formatDMonthYYYY(d) {
  return `${formatDMonth(d)} ${d.getUTCFullYear()}`;
}

export function formatDayDMnYYYY(d) {
  return `${DAY_SHORT_NAMES[d.getUTCDay()]}, ${formatDMn(d)} ${d.getUTCFullYear()}`;
}

export function formatPercentage() {

}

function getRAF() {
  return window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function (callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
}

export const rAF = getRAF();

export const createViewport = (x, y, width, height) => ({
  x, y, width, height,
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

export function addClass(el, className) {
  const newClassName = `${el.className} ${className}`;
  // eslint-disable-next-line no-param-reassign
  el.className = newClassName.trim();
}

export function removeClass(el, className) {
  // eslint-disable-next-line no-param-reassign
  el.className = el.className.replace(className, '').replace(/\s/g, ' ').trim();
}

export function hideEl(el) {
  // eslint-disable-next-line no-param-reassign
  el.style.display = 'none';
}

export function showEl(el) {
  // eslint-disable-next-line no-param-reassign
  el.style.display = null;
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
