const createLasso = require('lasso-canvas-image');

const $img = document.querySelector('img');
const $out1 = document.querySelector('#output1');
const $out2 = document.querySelector('#output2');
const $polygon = document.querySelector('polygon');

$polygon.parentElement.setAttribute('width', $img.width);
$polygon.parentElement.setAttribute('height', $img.height);

const lasso = createLasso({
  element: $img,
  radius: 10,
  onChange: (polygon) => {
    $out1.innerHTML = 'onChange(): ' + polygon,
    $polygon.setAttribute('points', polygon);
  },
  onUpdate: (polygon) => {
    $out2.innerHTML = 'onUpdate(): ' + polygon
  }
});

document.querySelector('button').addEventListener('click', () => lasso.reset());
