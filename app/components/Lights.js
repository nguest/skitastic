import * as THREE from 'three';
import * as WHS from 'whs';

const Lights = (app) => {
  const light = new WHS.DirectionalLight( {

    color: 0xffffff,
    intensity: 0.7,
    distance: 300,
    decay: 0.1,

    position: [0,500,0],

    shadow: Object.assign({
      fov: 90,
      camera: {
        near: 0,
        far: 500,
        left: -500,
        right: 500,
        top: 500,
        bottom: -500,

      }
    }, {shadowMap: THREE.PCFSoftShadowMap}),
    
    // target: {
    //   x: 0, y: -20, z: 300
    // }
  })
  light.addTo(app);

  const ambient = new WHS.AmbientLight({
    intensity: 0.2
  })
  ambient.addTo(app);

}

export default Lights;
