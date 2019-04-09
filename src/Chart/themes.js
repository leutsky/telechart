const base = {
  fontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Light", Helvetica, Arial , Verdana, sans-serif',
  fontSize: '15px',
};

export const light = Object.assign({}, base, {
  backgroundColor: '#ffffff',
  cursorColor: '#E0E6EA',
  gridColor: '#f4f4f4',
  labelColor: '#929EA6',
  fadeColor: 'rgba(242,246,250,0.7)',
  sliderColor: 'rgba(100,144,177,0.4)',
});

export const dark = Object.assign({}, base, {
  backgroundColor: '#262F3D',
  cursorColor: '#3E4A59',
  gridColor: '#333D4C',
  labelColor: '#586776',
  fadeColor: 'rgba(28,37,50,0.8)',
  sliderColor: 'rgba(100,144,177,0.4)',
});

export const day = Object.assign({}, base, {
  backgroundColor: '#ffffff',
  cursorLineColor: 'rgba(24,45,59,.1)',
  cursorFadeColor: 'rgba(255,255,255,.5)',
  gridColor: 'rgba(24,45,59,.1)',
  xLabelColor: 'rgba(37,37,41,0.5)',
  yLabelColor: 'rgba(37,37,41,0.5)',
});

export const night = Object.assign({}, base, {
  backgroundColor: '#242F3E',
  cursorLineColor: 'rgba(255,255,255,.2)',
  cursorFadeColor: 'rgba(36,47,62,.5)',
  gridColor: 'rgba(255,255,255,.1)',
  xLabelColor: 'rgba(163,177,194,0.6)',
  yLabelColor: 'rgba(236,242,248,0.5)',
});
