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
