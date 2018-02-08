import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';


const Tree = (posn) => {


  // const tree2 = new WHS.Importer({
  //   //loader: new THREE.JSONLoader(),
  //   loader: new THREE.ObjectLoader(),
  //   url: './assets/firTree.json',
  //   // modules: [
  //   //   new PHYSICS.ConcaveModule({
  //   //     friction: 0.9,
  //   //     mass: 0,
  //   //     restitution: 0.5,
  //   //     //path: `${process.assetsPath}/models/teapot/utah-teapot-light.json`,
  //   //     //scale: new THREE.Vector3(1,1,1)
  //   //     //scale: new THREE.Vector3(scaleX,scaleX,scaleZ),
  //   //   }),
  //   //   // new WHS.TextureModule({
  //   //   //   url: './assets/textures/UV_Grid_Sm.png',
  //   //   //   repeat: new THREE.Vector2(10,10),
  //   //   //   // wrapS: THREE.ClampToEdgeWrapping,
  //   //   //   // wrapT: THREE.ClampToEdgeWrapping,
  //   //   // })
  //   // ],
  //   //material,
  //   // material: new THREE.MeshPhongMaterial({
  //   //   color: 0xffffff,
  //   //   //flatShading: false,
  //   //   side: THREE.DoubleSide,
  //   //   //wireframe: false,
  //   //   shininess: 80,
  //   //   //specular: 0x999999,
  //   //   //map: textureMap,
  //   // }),
  //   shadow: {
  //     cast: true,
  //     receive: true
  //   },    //material: materialWHS,
  //   //position: posn,
  //   rotation: [0, 0, Math.PI/100],
  //   //scale: [scaleX,scaleX,scaleZ]
  // })
  const tree = new WHS.Importer({
    url: './assets/firTree.json',
    loader: new THREE.ObjectLoader(),
  
    parser(scene) {
      return WHS.Importer.filter(scene, el => {
        return !el.isLight;
      });
    },
  
    position: [0, 50, 0],
    rotation: new THREE.Euler(0, Math.PI / 2 * 3, 0)
  })

  //const tree = new THREE.ObjectLoader().load('./assets/firTree.json')
  console.log('t',tree)


  //terrain.receiveShadow = true;
  
  //terrain.native.name = "terrain"

  return tree;
};
  

export default Tree;