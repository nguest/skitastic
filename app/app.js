import * as THREE from 'three';
import * as UTILS from './globals';
import * as WHS from 'whs';
//import Ammo from './modules/ammo'
import * as PHYSICS from './modules/physics-module';
import StatsModule from './modules/StatsModule';

const app = new WHS.App([
  new WHS.ElementModule(),
  new WHS.SceneModule(),
  new WHS.DefineModule('camera',
    new WHS.PerspectiveCamera({
      position: new THREE.Vector3(0, 50, 150),
      far: 1000
    })
  ),
  new WHS.RenderingModule(UTILS.appDefaults.rendering, {
    shadow: true
  }),
  new PHYSICS.WorldModule(UTILS.appDefaults.physics),
  new WHS.OrbitControlsModule(),
  new WHS.ResizeModule(),
  new StatsModule()
]);
import {FancyMaterialModule} from './modules/FancyMaterialModule';
import {BasicComponent} from './components/BasicComponent';


//UTILS.addBoxPlane(app);
UTILS.addBasicLights(app);

// u, v go 0=>1
const func = (u, v) =>
  //new THREE.Vector3(u * 100, Math.sin(u * 10) * 4, v * 100);
  new THREE.Vector3(u * 200, 120*Math.pow((u-0.5),2)-v*20, v * 200);

const heightSegments = {x:4,y:4}

const scaleX = 1

const terrain = new WHS.Parametric({
  geometry: {
    func,
    slices: heightSegments.x,
    stacks: heightSegments.y,
  },

  scale: new THREE.Vector3(scaleX,1,1),

  shadow: {
    cast: false
  },

  material: new THREE.MeshPhongMaterial({
    color: 0xdddddd,//sUTILS.$colors.mesh,
    side: THREE.DoubleSide,
    wireframe: true,
  }),

  modules: [
    new PHYSICS.HeightfieldModule({
      mass: 0,
      size: new THREE.Vector2(heightSegments.x, heightSegments.y),
      autoAlign: true,
      scale: new THREE.Vector3(scaleX,1,1),
      friction: 0.7
    })
  ]
});

console.log(terrain.geometry.vertices, {terrain})

terrain.addTo(app);


const teapot = new WHS.Importer({
  url: `${process.assetsPath}/models/teapot/utah-teapot-large.json`,

  modules: [
    new PHYSICS.ConcaveModule({
      friction: 1,
      mass: 200,
      restitution: 0.5,
      path: `${process.assetsPath}/models/teapot/utah-teapot-light.json`,
      scale: new THREE.Vector3(4, 4, 4)
    }),
    new WHS.TextureModule({
      url: `${process.assetsPath}/textures/teapot.jpg`,
      repeat: new THREE.Vector2(1, 1)
    })
  ],

  useCustomMaterial: true,

  material: new THREE.MeshPhongMaterial({
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide
  }),

  position: {
    y: 100
  },

  scale: [4, 4, 4]
});
// app.add(new BasicComponent({
//   modules: [
//     new FancyMaterialModule(app)
//   ],
//   position: new THREE.Vector3(10, 5, 0),
// }));

// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(3, 5, 12),
//   new THREE.MeshPhongMaterial({
//     color: UTILS.$colors.mesh
//   }),
// )
// sphere.physics = false;
//app.add(sphere)

const sphere = new WHS.Sphere({ // Create sphere comonent.
  geometry: {
    radius: 5,
    widthSegments: 32,
    heightSegments: 32
  },

  modules: [
    new PHYSICS.SphereModule({
      mass: 10,
      restitution: 1
    })
  ],

  material: new THREE.MeshPhongMaterial({
    color: UTILS.$colors.mesh
  }),

  position: new THREE.Vector3(9, 50, 0)
});
app.add(sphere)

app.start()

console.log({app})

document.getElementById('reset').addEventListener('click',()=>{
  app.stop()
  sphere.position.set(9,50,0);
  app.start();
})
