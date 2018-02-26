import * as THREE from 'three';
import * as WHS from 'whs';
import APPCONFIG from '../AppConfig';

class SkyBox {
  constructor(app, scene) {
    const path = './assets/skybox2/';
    var cubeMap = new THREE.CubeTextureLoader().load([
        path + 'right.jpg',
        path + 'left.jpg',
        path + 'top.jpg',
        path + 'bottom.jpg',
        path + 'front.jpg',
        path + 'back.jpg'
    ]);

    var cubeMap = new THREE.CubeTextureLoader().load([
      path + 'left.jpg',
      path + 'right.jpg',
      path + 'top.jpg',
      path + 'left.jpg',
      path + 'back.jpg',
      path + 'back.jpg'
  ]);
    cubeMap.format = THREE.RGBFormat;

    var skyShader = THREE.ShaderLib['cube'];
    skyShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: skyShader.fragmentShader,
        vertexShader: skyShader.vertexShader,
        uniforms: skyShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    const size = 300;

    this.skybox = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        skyBoxMaterial
    )

    this.skybox.rotation.set(0, Math.PI/2,0);

    this.skybox.matrixWorldNeedsUpdate = true;
    this.skybox.material.needsUpdate = true;
    this.skybox.position.set(
      APPCONFIG.skyboxPosition.x,
      APPCONFIG.skyboxPosition.y,
      APPCONFIG.skyboxPosition.z,
    )

    scene.add(this.skybox)
  }
  getCube() {
    return this.skybox;
  }
    //skybox.addTo(app);
}

export default SkyBox;