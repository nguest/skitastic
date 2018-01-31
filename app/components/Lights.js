import * as THREE from 'three';
import * as WHS from 'whs';

//const Lights = (app, scene) => {

class Lights {
  constructor(app,scene) {

    const pow = 12;
    const l = 500;
    this.dlight = new WHS.DirectionalLight( {

      color: 0xffffff,
      intensity: 1.0,
      distance: 300,
      decay: 0.1,

      castShadow: true,

      position: [20,20,0],

      shadow: Object.assign({
        fov: 90,
        camera: {
          near: 0,
          far: 500,
          left: -l,
          right: l,
          top: l,
          bottom: -l,


        },
        //radius: 10,
        mapSize: {
          width: Math.pow(2,pow),
          height: Math.pow(2,pow),
        }
      }, {shadowMap: THREE.PCFSoftShadowMap}),
      
    })
    this.dlight.addTo(app);

    //this.dlight.
    const helper = new THREE.DirectionalLightHelper(this.dlight.native)
    scene.add(helper)
    const helper2 = new THREE.CameraHelper(this.dlight.native.shadow.camera)
    scene.add(helper2)

    const ambient = new WHS.AmbientLight({
      intensity: 0.2
    })
    ambient.addTo(app);
  }


  getShadowCamera() {
    this.dlight.native.shadow.camera.name = 'hello'
    return this.dlight.native.shadow.camera;
  }
  getDLight() {
    this.dlight.native.shadow.camera.name = 'hello'
    return this.dlight.native;
  }

}

export default Lights;
