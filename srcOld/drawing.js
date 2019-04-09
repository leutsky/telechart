import { getPixelRatio, formatDateDay } from './utils';

// const theme = {
//   textColor: '#929EA6',
//   fontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Light", Helvetica, Arial , Verdana, sans-serif',
//   fontSize: '15px',
// };

const gridLevels = [45, 120, 195, 270, 345, 420].reverse();

const pixelRatio = getPixelRatio();

function setScale(ctx) {
  ctx.scale(pixelRatio, pixelRatio);
}

export function clearRect(ctx, vp) {
  ctx.save();

  setScale(ctx);
  ctx.clearRect(
    vp.x - vp.cx0,
    vp.y - vp.cy0,
    vp.width + vp.cx0 + vp.cx1,
    vp.height + vp.cy0 + vp.cy1,
  );

  ctx.restore();
}

export function drawCharts(ctx, dataset, state, vp, lineWidth = 2) {
  const {
    startIndex, endIndex, stepX, stepY, offsetX, offsetY,
  } = state;

  ctx.save();

  ctx.setTransform(
    pixelRatio, 0, 0, -pixelRatio,
    (offsetX + vp.x) * pixelRatio,
    (offsetY + vp.height + vp.y) * pixelRatio,
  );

  ctx.lineJoin = 'round';
  ctx.lineWidth = lineWidth;
  dataset.order.forEach((id) => {
    const { color, column, visible } = dataset.data[id];

    if (!visible) {
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(startIndex * stepX, column[startIndex] * stepY);

    for (let i = startIndex + 1; i <= endIndex; i += 1) {
      ctx.lineTo(i * stepX, column[i] * stepY);
    }

    ctx.stroke();
  });

  ctx.restore();
}

export function drawGrid(ctx, vp, theme) {
  ctx.save();
  setScale(ctx);

  ctx.lineWidth = pixelRatio === 1 ? 2 : 1.5;
  ctx.strokeStyle = theme.gridColor;
  ctx.beginPath();
  gridLevels.forEach((y) => {
    ctx.moveTo(vp.x, y + vp.y);
    ctx.lineTo(vp.width, y + vp.y);
  });
  ctx.stroke();

  ctx.restore();
}

export function drawYLabels(ctx, { axisY }, vp, theme) {
  ctx.save();
  setScale(ctx);

  ctx.fillStyle = theme.labelColor;
  ctx.font = `${theme.fontSize} ${theme.fontFamily}`;

  gridLevels.forEach((y, idx) => {
    ctx.fillText(axisY.min + axisY.tickStep * idx, vp.x, y - 7 + vp.y);
  });

  ctx.restore();
}

export function drawXLabels(ctx, labels, { axisX, offsetX, stepX }, vp, theme) {
  ctx.save();
  ctx.setTransform(
    pixelRatio, 0, 0, pixelRatio,
    (offsetX + vp.x) * pixelRatio,
    440 * pixelRatio,
  );

  ctx.fillStyle = theme.labelColor;
  ctx.textAlign = 'center';
  ctx.font = `${theme.fontSize} ${theme.fontFamily}`;

  for (let i = axisX.startIndex; i <= axisX.endIndex; i += axisX.tickStep) {
    ctx.fillText(labels[i], i * stepX, 0);
  }

  ctx.restore();
}

export function drawScroll(ctx, geometry, sideWidth, vp, theme) {
  const innerWidth = geometry.right - geometry.left;
  const outerWidth = innerWidth + 2 * sideWidth;

  clearRect(ctx, vp);

  ctx.save();
  setScale(ctx);

  ctx.fillStyle = theme.fadeColor;
  ctx.fillRect(vp.x, vp.y, vp.width, vp.height);

  ctx.fillStyle = theme.sliderColor;
  ctx.clearRect(geometry.left - sideWidth, vp.y, outerWidth, vp.height);
  ctx.fillRect(geometry.left - sideWidth, vp.y, outerWidth, vp.height);

  ctx.clearRect(geometry.left, vp.y + 2, innerWidth, vp.height - 4);

  ctx.restore();
}

export function drawCursor(ctx, dataset, state, index, vp, theme) {
  const {
    stepX, stepY, offsetX, offsetY,
  } = state;

  clearRect(ctx, vp);

  ctx.save();

  ctx.setTransform(
    pixelRatio, 0, 0, pixelRatio,
    (offsetX + vp.x) * pixelRatio,
    vp.y * pixelRatio,
  );

  const coordX = index * stepX;

  ctx.beginPath();
  ctx.strokeStyle = theme.cursorColor;
  ctx.moveTo(coordX, 0);
  ctx.lineTo(coordX, vp.height);
  ctx.stroke();

  ctx.setTransform(
    pixelRatio, 0, 0, -pixelRatio,
    (offsetX + vp.x) * pixelRatio,
    (offsetY + vp.height + vp.y) * pixelRatio,
  );

  dataset.order.forEach((id) => {
    const data = dataset.data[id];

    if (!data.visible) {
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = data.color;
    ctx.lineWidth = '3';
    ctx.fillStyle = theme.backgroundColor;
    ctx.arc(coordX, data.column[index] * stepY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}
