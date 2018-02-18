import * as THREE from 'three';
import * as WHS from 'whs';

export default class Label extends WHS.MeshComponent {
  constructor(params = { position: [0,-100,-500], size:100}) {
    super(params, Object.assign(WHS.MeshComponent.defaults, {
      text: 'Hello world!',
      color: '#ffffff',
      size: 40
    }));
  }

  build() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    const {canvas, ctx} = this;
    const {text, bgColor, color, size} = this.params;

    ctx.font = `Bold ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    // const size = ctx.measureText(text);
    ctx.fillText(text, 150, 75);

    // ctx.fillStyle = 'green';
    // ctx.fillRect(10, 10, 100, 100);

    const texture = new THREE.Texture(this.canvas);
    texture.needsUpdate = true;

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({map: texture})
    );

    return sprite;
  }
}
