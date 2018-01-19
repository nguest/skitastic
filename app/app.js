import * as THREE from 'three';
import * as UTILS from './globals';
import * as WHS from 'whs';
//import Ammo from './modules/ammo'
import * as PHYSICS from './modules/physics-module';
import StatsModule from './modules/StatsModule';

const app = new WHS.App([
  new WHS.ElementModule(),
  new WHS.SceneModule(),
  new WHS.DefineModule('camera', new WHS.PerspectiveCamera(UTILS.appDefaults.camera)),
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

console.log(process)
// const app = new App([
//   new ElementModule(document.getElementById('app')),
//   new SceneModule(),
//   new DefineModule('camera', new PerspectiveCamera({
//     position: {y: 20, z: -30
//     }
//   })),
//   new RenderingModule({bgColor: 0x444444}),
//   new OrbitControlsModule()
// ]);

UTILS.addBoxPlane(app);
UTILS.addBasicLights(app);


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

  position: new THREE.Vector3(0, 20, 0)
});
app.add(sphere)

app.start();
