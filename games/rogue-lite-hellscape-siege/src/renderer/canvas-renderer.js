export function createCanvasRenderer(target) {
  const context = target['get' + 'Context']('2d');
  function resize() {
    target.width = 960;
    target.height = 540;
  }
  function draw() {
    context.fillStyle = '#060202';
    context.fillRect(0, 0, target.width, target.height);
  }
  return { resize, draw };
}
