var min = [93, 123, 3212, 53234, 234552, 1000220];
var width = 6;

// for (var i = 0; i < min.length; i++) {
//   console.log('a', min[i], getYAxis(min[i], min[i] + width));
// }

[1,2,3,43,56,99,345,654,875,987,1234,4321,432432,43212312,312324234].forEach((n) => {
  console.log('val', n, get2deg(n));
});

function getYAxis(min, max, ticks = 6) {
  var range = max - min;

  if (ticks < 2) {
    ticks = 2;
  } else if (ticks > 2) {
    ticks -= 1;
  }

  var tempStep = range / ticks;
  var mag = Math.floor(Math.log10(tempStep));
  var magPow = 10 ** mag;
  var magMsd = Math.floor(tempStep / magPow + 0.5);
  var step = magPow * magMsd;
  var nextMin = step * Math.floor(min / step);
  var nextMax = step * Math.ceil(max / step);

  return [nextMin, nextMax, step];
}

function get2deg(n) {
  let tickStep = n;
  let tmpStep = 1;
  while (tmpStep < tickStep) tmpStep *= 2;
  return tmpStep;
}
