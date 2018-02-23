import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
//import centerLine from '../components/centerLine';

class Terrain {

  constructor(app) {
    const track = new WHS.Importer({
      loader: new THREE.JSONLoader(),
      url: './assets/track2.json',

      modules: [
        new PHYSICS.ConcaveModule({
          friction: 0.3,
          mass: 0,
          restitution: 0.1,
          //loader: new THREE.JSONLoader(),
          //path: './assets/track3.json',

        }),
      ],
      shadow: {
        receive: true
      },
      position: {
        y: 0
      },
      buffer: true,
      // parser(geometry, materials) {
      //   //console.log({input})
      //   return new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geometry), materials);
      // },
    }).addTo(app)

    const terrainOuter = new WHS.Importer({
      loader: new THREE.JSONLoader(),
      url: './assets/trackOuter.json',
      shadow: {
        receive: true
      },
      position: {
        y: 0
      },
    }).addTo(app)


    const centerLine = new WHS.Importer({
      loader: new THREE.JSONLoader(),
      url: './assets/centerLine.json',
      position: {
        y: 0
      },
    }).addTo(app)

  
    return [track, terrainOuter, centerLine];
  }

  getTerrain() {
    return track;
  }
};
  
export default Terrain;