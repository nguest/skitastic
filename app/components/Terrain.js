import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';

// const scaleX = 10;
// const scaleZ = 10;



class Terrain {
  // const textureMap = new THREE.TextureLoader().load('./assets/textures/UV_Grid_Sm.png', texture => {
  //   texture.wrapS = THREE.RepeatWrapping;
  //   texture.wrapT = THREE.RepeatWrapping;
  //   texture.repeat.set( 1, 1 );
  // })
  constructor(app) {
    const track = new WHS.Importer({
      loader: new THREE.JSONLoader(),
      url: './assets/track4.json',
      modules: [
        new PHYSICS.ConcaveModule({
          friction: 0.9,
          mass: 0,
          restitution: 0.5,
        }),
      ],
      shadow: {
        receive: true
      },
      position: {
        y: 0
      },
      rotation: [0, 0, Math.PI/100],
    })

    const terrainOuter = new WHS.Importer({
      loader: new THREE.JSONLoader(),
      url: './assets/trackOuter.json',
      shadow: {
        receive: true
      },
      position: {
        y: 0
      },
      rotation: [0, 0, Math.PI/100],
    })

  //terrain.receiveShadow = true;

    console.log({'track':track})
  
  //terrain.native.name = "terrain"
    return [track, terrainOuter];
  }

  getTerrain() {
    return track;
  }

};
  

export default Terrain;