import * as THREE from 'three';
import * as UTILS from './globals';
import * as WHS from 'whs';
import * as PHYSICS from './modules/physics-module';
import StatsModule from './modules/StatsModule';
import loadSkyBox from './components/Skybox';
import importTerra from './components/Terrain';
import Slider from './components/Slider';


const scene = new THREE.Scene();

let firstPerson = true;

const app = new WHS.App([
  new WHS.ElementModule(),
  new WHS.SceneModule(true),
]);

app.setScene(scene);

app
  .module(new WHS.DefineModule('camera',
    new WHS.PerspectiveCamera({
      position: new THREE.Vector3(0, 20, 0),
      target: new THREE.Vector3(0, -20, 400),

      rotation: new THREE.Vector3(0, Math.PI, 0),
      far: 25000,
      near: 0.1,
      fov: 25,
    })
  ))
  .module(
    new WHS.RenderingModule({ 
    ...UTILS.appDefaults.rendering, 
    shadow: true,
    bgColor: 0xaaddff,
    }),
  )
  .module(new PHYSICS.WorldModule(UTILS.appDefaults.physics))
  .module(firstPerson ? null : new WHS.OrbitControlsModule())
  .module(new WHS.ResizeModule())
  .module(new StatsModule())

// Add the objects
const camera = app.manager.get('camera');
const skyBox = loadSkyBox(app, scene);
const slider = Slider();
const terrain = importTerra();
const timeDisplay = document.querySelector('#timeDisplay');
const scaleX = 10
const scaleZ = 10


UTILS.addBasicLights({app, position:[0, 200, 0], intensity: 1, distance: 100 });

const cube = new WHS.Box({ // Create box comonent.
  geometry: {
    width: 400,
    height: 100,
    depth: 100
  },

  modules: [
    new PHYSICS.BoxModule({
      mass: 0,
      restitution: 1,
      friction: 1,
      //scale: new THREE.Vector3(1, 100, 100)
    })
  ],

  material: new THREE.MeshPhongMaterial({
    color: 0xff3333,
  }),

  position: new THREE.Vector3(0, -2600, -12000)
});


// add things
terrain.addTo(app).then(() => {
  //const boxMin = importTerra().geometry.boundingBox.min;
  //cube.position = boxMin.multiplyScalar(scaleX)
  cube.addTo(app)
  slider.addTo(app);
});


const gameLoop = new WHS.Loop((clock) => {
  if (firstPerson) {
    camera.position.x = slider.position.x+1;
    camera.position.y = slider.position.y+0.25;
    camera.position.z = slider.position.z;
    camera.native.lookAt(new THREE.Vector3(0, -2000, -20000));
  }
  
  timeDisplay.innerHTML = clock.getElapsedTime().toPrecision(3)
  
})

gameLoop.start(app);

app.start()

// Event Listeners

document.getElementById('reset').addEventListener('click',()=>{
  app.stop();
  slider.position.set(-1, 0, 0);
  app.start();
})
document.getElementById('camera').addEventListener('click',()=>{
  firstPerson = !firstPerson
})


