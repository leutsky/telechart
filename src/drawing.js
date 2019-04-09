import {
  FIRST_INDEX,
  Y_LABEL_SPACING,
  Y_STICK_LEFT,
  CHART_TYPE_AREA,
  CHART_TYPE_BAR,
  CHART_TYPE_LINE,
} from './constants';
import { hasTransition, haveTransitions } from './utils';

export function getPixelRatio() {
  return window.devicePixelRatio || 1;
}

const pixelRatio = getPixelRatio();

function setScale(ctx) {
  ctx.scale(pixelRatio, pixelRatio);
}

export function getContext(canvas) {
  return canvas.getContext('2d');
}

export function clearRect(ctx, vp) {
  ctx.save();

  setScale(ctx);
  ctx.clearRect(vp.x, vp.y, vp.width, vp.height);

  ctx.restore();
}

function prepareDrawingText(ctx, color, theme) {
  ctx.font = `${theme.fontSize} ${theme.fontFamily}`;
  ctx.fillStyle = color;
}

export function drawCharts(ctx, state, vp, drawPreview = false, lineWidth = 2) {
  const {
    data, xAxis,
  } = state;

  let startIndex;
  let endIndex;
  let xProps;

  // TODO: вынести на уровень вызова
  if (drawPreview) {
    startIndex = state.firstIndex;
    endIndex = state.lastIndex;
    xProps = xAxis.preview;
  } else {
    /* eslint-disable prefer-destructuring */
    startIndex = state.startIndex;
    endIndex = state.endIndex;
    /* eslint-disable prefer-destructuring */
    xProps = xAxis;
  }

  ctx.save();

  const offsetX = xProps.offset * vp.width;
  const stepX = xProps.scale * vp.width;
  let offsetStacked;
  let poweredData;
  let poweredDataIds = {};

  // Prepare powered data
  for (let dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
    const dataItem = data[dataIdx];

    if (dataItem.stacked && hasTransition(dataItem, 'power')) {
      const { power, column } = dataItem;

      poweredDataIds[dataItem.id] = true;

      if (!poweredData) {
        poweredData = [];

        for (let i = startIndex; i <= endIndex; i += 1) {
          poweredData[i] = power * column[i];
        }
      } else {
        for (let i = startIndex; i <= endIndex; i += 1) {
          poweredData[i] += power * column[i];
        }
      }
    }
  }

  // Drawing
  for (let dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
    const dataItem = data[dataIdx];

    if (!(dataItem.visible || haveTransitions(dataItem))) {
      continue; // eslint-disable-line no-continue
    }

    const {
      column, yAxis, power, type,
    } = dataItem;
    const {
      percentage, totalStacked,
    } = yAxis;
    const yProps = drawPreview ? yAxis.preview : yAxis;
    const stepY = (percentage ? 100 / yProps.ticks.max : yProps.scale) * vp.height;
    const poweredStepY = stepY * power;
    const minYValue = yProps.ticks.min;

    ctx.save();
    setScale(ctx);

    ctx.globalAlpha = dataItem.opacity;
    ctx.beginPath();

    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = dataItem.color;
    ctx.fillStyle = dataItem.color;

    const getXByIdx = idx => idx * stepX + offsetX;
    let getYByIdx;
    if (dataItem.stacked) {
      if (!offsetStacked) {
        offsetStacked = [];

        for (let i = startIndex; i <= endIndex; i += 1) {
          offsetStacked[i] = 0;
        }
      }

      getYByIdx = percentage
        ? idx => vp.height - (offsetStacked[idx] += (column[idx] - minYValue) * poweredStepY / totalStacked[idx])
        : idx => vp.height - (offsetStacked[idx] += ((column[idx] - minYValue) * poweredStepY) >> 0 || 1);

      ctx.globalCompositeOperation = 'destination-over';
    } else {
      getYByIdx = percentage
        ? valueIndex => vp.height - poweredStepY * (column[valueIndex] - minYValue) / yProps.ticks.max
        : valueIndex => (vp.height - (column[valueIndex] - minYValue) * poweredStepY);
    }

    if (type === CHART_TYPE_LINE) {
      ctx.moveTo(getXByIdx(startIndex), getYByIdx(startIndex));

      for (let index = startIndex + 1; index <= endIndex; index += 1) {
        ctx.lineTo(getXByIdx(index), getYByIdx(index));
      }

      ctx.stroke();
    } else if (type === CHART_TYPE_BAR) {
      const valueY0 = vp.height;
      let valueY;
      let valueX;

      ctx.moveTo(getXByIdx(startIndex - 0.5), valueY0);

      for (let index = startIndex; index <= endIndex; index += 1) {
        valueX = getXByIdx(index - 0.5);
        valueY = getYByIdx(index);

        ctx.lineTo(valueX, valueY);
        ctx.lineTo(valueX + stepX, valueY);
      }

      ctx.lineTo(getXByIdx(endIndex + 0.5), valueY0);
      ctx.closePath();
      ctx.fill();
    } else if (type === CHART_TYPE_AREA) {
      const valueY0 = vp.height;

      ctx.moveTo(getXByIdx(startIndex), valueY0);

      for (let index = startIndex; index <= endIndex; index += 1) {
        ctx.lineTo(getXByIdx(index), getYByIdx(index));
      }

      ctx.lineTo(getXByIdx(endIndex), valueY0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

export function drawYAxes(ctx, state, vp, theme) {
  const {
    yAxes,
  } = state;

  ctx.save();
  setScale(ctx);

  prepareDrawingText(ctx, theme.yLabelColor, theme);
  ctx.lineWidth = pixelRatio === 1 ? 2 : 1.5;

  let leftOffset = 0;
  let rightOffset = 0;
  let showGrid = true;

  for (let axisIdx = 0; axisIdx < yAxes.length; axisIdx += 1) {
    const yAxis = yAxes[axisIdx];
    const {
      color, ticks, scale, stick, visible, percentage,
    } = yAxis;

    if (!(visible || hasTransition(yAxis, 'opacity'))) {
      continue; // eslint-disable-line
    }

    const stepY = (percentage ? 1 / ticks.max : scale) * vp.height;

    if (color) {
      ctx.fillStyle = color;
    }
    ctx.strokeStyle = theme.gridColor;
    ctx.textAlign = stick;

    ctx.beginPath();
    ctx.globalAlpha = yAxis.opacity;
    for (let label = ticks.min; label < ticks.max; label += ticks.step) {
      const y = Math.round(vp.height - (label - ticks.min) * stepY);
      const x = vp.x;

      ctx.fillText(label, stick === Y_STICK_LEFT ? x + leftOffset : vp.width + x + rightOffset, y - 7);

      if (showGrid) {
        ctx.moveTo(x, y);
        ctx.lineTo(vp.width, y);
      }
    }
    ctx.stroke();
    showGrid = false;

    const labelWidth = ctx.measureText(ticks.max).width + Y_LABEL_SPACING;

    if (stick === Y_STICK_LEFT) {
      leftOffset += labelWidth;
    } else {
      rightOffset -= labelWidth;
    }
  }

  ctx.restore();
}

export function drawXAxis(ctx, state, vp, theme) {
  const {
    xAxis, endIndex,
  } = state;

  ctx.save();
  setScale(ctx);
  prepareDrawingText(ctx, theme.xLabelColor, theme);
  ctx.textAlign = 'center';

  const stepX = xAxis.scale * vp.width;
  const offsetX = xAxis.offset * vp.width;

  let labelIndex = xAxis.startIndex;

  while (labelIndex < endIndex) {
    ctx.globalAlpha = xAxis.getOpacity(labelIndex);

    ctx.fillText(xAxis.getLabel(labelIndex), labelIndex * stepX + offsetX, vp.height + vp.y - 4);
    labelIndex += xAxis.tickStep;
  }

  ctx.restore();
}

export function drawCursor(ctx, state, index, vp, theme) {
  const {
    data, xAxis,
  } = state;

  ctx.save();
  setScale(ctx);


  const cursorLineWidth = pixelRatio === 1 ? 2 : 1.5;
  const stepX = xAxis.scale * vp.width;
  const offsetX = xAxis.offset * vp.width;
  const coordX = index * stepX + offsetX;

  let showLine = false;
  let showFade = false;

  for (let dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
    const dataItem = data[dataIdx];

    if (!dataItem.visible) {
      continue; // eslint-disable-line
    }

    const { type } = dataItem;

    if (type === CHART_TYPE_LINE || type === CHART_TYPE_AREA) {
      showLine = true;
    } else if (type === CHART_TYPE_BAR) {
      showFade = true;
    }
  }

  if (showLine) {
    ctx.beginPath();
    ctx.lineWidth = cursorLineWidth;
    ctx.strokeStyle = theme.cursorLineColor;
    ctx.moveTo(coordX, 0);
    ctx.lineTo(coordX, vp.height);
    ctx.stroke();
  }

  if (showFade) {
    ctx.fillStyle = theme.cursorFadeColor;

    let rectX = coordX - stepX / 2;
    ctx.fillRect(vp.x, vp.y, rectX, vp.height);

    rectX = coordX + stepX / 2;
    ctx.fillRect(rectX, vp.y, vp.width - rectX, vp.height);
  }

  for (let dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
    const dataItem = data[dataIdx];

    if (!dataItem.visible) {
      continue; // eslint-disable-line
    }

    const { type, yAxis } = dataItem;
    const stepY = vp.height * yAxis.scale;

    if (type === CHART_TYPE_LINE) {
      ctx.beginPath();
      ctx.strokeStyle = dataItem.color;
      ctx.lineWidth = '3';
      ctx.fillStyle = theme.backgroundColor;
      ctx.arc(coordX, vp.height - (dataItem.column[index] - yAxis.ticks.min) * stepY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }


  // for (let dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
  //   const { type, visible } = data[dataIdx];
  // }
  //
  // dataset.order.forEach((id) => {
  //   const data = dataset.data[id];
  //
  //   if (!data.visible) {
  //     return;
  //   }
  //
  //   ctx.beginPath();
  //   ctx.strokeStyle = data.color;
  //   ctx.lineWidth = '3';
  //   ctx.fillStyle = theme.backgroundColor;
  //   ctx.arc(coordX, data.column[index] * stepY, 6, 0, 2 * Math.PI);
  //   ctx.fill();
  //   ctx.stroke();
  // });

  ctx.restore();
}
