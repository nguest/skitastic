import * as THREE from 'three';
import * as WHS from 'whs';
import APPCONFIG, { isDev } from '../AppConfig';

class Lights {
  constructor(app,scene) {

    const pow = 11;
    const l = 30;
    this.dlight = new WHS.DirectionalLight( {

      color: 0xDDDDff,
      intensity: 1.5,
      distance: 100,
      decay: 0.1,

      castShadow: true,

      position: APPCONFIG.lightPosition,//[10,100,10],

      shadow: Object.assign({
        //fov: 90,
        // camera: {
        //   near: 20,
        //   far: 100,
        //   left: -400,
        //   right: 400,
        //   top: 400,
        //   bottom: -400,
        // },
        camera: {
          near: 20,
          far: 100,
          left: -l,
          right: l,
          top: l,
          bottom: -l,
        },
        //radius: 0.1,
        mapSize: {
          width: Math.pow(2,pow),
          height: Math.pow(2,pow),
        }
      }), //{shadowMap: THREE.PCFSoftShadowMap}),
      
    })
    this.dlight.addTo(app);

    // light for shiny
    this.dlight2 = new WHS.DirectionalLight( {
      color: 0xDDDDff,
      intensity: 0.5,
      distance: 300,
      decay: 0.1,
      position: [10,20,-110],

    }).addTo(app)

    console.log({isDev})
    const helper = new THREE.DirectionalLightHelper(this.dlight.native)
    if (isDev) scene.add(helper)
    const helper2 = new THREE.CameraHelper(this.dlight.native.shadow.camera)
    if (isDev) scene.add(helper2)

    const ambient = new WHS.AmbientLight({
      intensity: 0.2
    })
    ambient.addTo(app);
  }


  getShadowCamera() {
    this.dlight.native.shadow.camera.name = 'shadowCamera'
    return this.dlight.native.shadow.camera;
  }
  getDLight() {
    this.dlight.native.shadow.camera.name = 'dLight'
    return this.dlight.native;
  }

}

export default Lights;
