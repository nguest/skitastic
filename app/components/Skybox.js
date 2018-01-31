import * as THREE from 'three';
import * as WHS from 'whs';


class SkyBox {
  constructor(app, scene) {
    const path = './assets/skybox/';
    var cubeMap = new THREE.CubeTextureLoader().load([
        path + 'right.jpg',
        path + 'left.jpg',
        path + 'top.jpg',
        path + 'bottom.jpg',
        path + 'front.jpg',
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

    // var skybox = WHS.MeshComponent.create(
    //     new THREE.BoxGeometry(100, 100, 100),
    //     skyBoxMaterial
    // );
    this.skybox = new THREE.Mesh(
        new THREE.BoxGeometry(500, 500, 500),
        skyBoxMaterial
    )

    //skybox.rotation.set(0, Math.PI/2,0);
    this.skybox.matrixWorldNeedsUpdate = true;
    this.skybox.material.needsUpdate = true;
    this.skybox.position.set(0,-100,-400)

    scene.add(this.skybox)
    console.log(this.skybox)
  }
  getCube() {
    return this.skybox;
  }
    //skybox.addTo(app);
}

export default SkyBox;