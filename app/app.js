import * as THREE from 'three';
import * as UTILS from './globals';
import * as WHS from 'whs';
import * as PHYSICS from './modules/physics-module';
import StatsModule from './modules/StatsModule';
import SkyBox from './components/Skybox';
import Terrain from './components/Terrain';
import Slider from './components/Slider';

import Controls from './modules/Controls';


//////////////////////////////////////
// Setup app and three scene                  
//////////////////////////////////////

const scene = new THREE.Scene();

let firstPerson = true;
let gameInProgress = false;

let activeCamera = new WHS.DefineModule('camera',
  new WHS.PerspectiveCamera({
    position: new THREE.Vector3(0, 20, 0),
    target: new THREE.Vector3(0, -20, 400),
    rotation: new THREE.Vector3(0, 0, 0),
    far: 25000,
    near: 0.1,
    fov: 25,
  })
);

const app = new WHS.App([
  new WHS.ElementModule(),
  new WHS.SceneModule(),
  activeCamera,
]);


app.setScene(scene);

app
  .module(
    new WHS.RenderingModule({ 
    ...UTILS.appDefaults.rendering, 
    //shadow: true,
    bgColor: 0xaaddff,
    }),
  )
  .module(new PHYSICS.WorldModule(UTILS.appDefaults.physics))
  .module(new WHS.OrbitControlsModule())
  .module(new WHS.ResizeModule())
  .module(new StatsModule())





//////////////////////////////////////
// Get the objects                   
//////////////////////////////////////

const camera = app.manager.get('camera')
const skyBox = SkyBox(app, scene);
const slider = Slider();
const terrain = Terrain();
const timeDisplay = document.querySelector('#timeDisplay');
const scaleX = 10
const scaleZ = 10

UTILS.addBasicLights({app, position: new THREE.Vector3(50, 1000, 0), intensity: 0.7,});

const cube = new WHS.Box({ // Create box component.
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
  shadow: {
    cast: true,
    receive: true
  },

  position: new THREE.Vector3(0, -2600, -12000)
});

const box = new WHS.Box({ // Create box comonent.
  geometry: [10, 10, 10],

  material: new THREE.MeshPhongMaterial({
    color: 0xff7777,
  }),
  modules: [
    new WHS.TextureModule({
      url: `./assets/textures/UV_Grid_Sm.png`,
      repeat: new THREE.Vector2(10,10)
    })
  ],
  shadow: {
    cast: true,
    receive: true
  },

  position: [-10, -40, -200]
});

console.log(box)

box.addTo(app);

const sph = new WHS.Sphere({ // Create sphere comonent.
  geometry: {
      radius: 10,
      widthSegments: 16,
      heightSegments: 16
  },
  
  modules: [
      new PHYSICS.SphereModule({
      mass: 20,
      restitution: 0.9,
      friction: 1,
      })
  ],
  shadow: {
    cast: true,
    receive: true
  },
  
  material: new THREE.MeshPhongMaterial({
    //color: UTILS.$colors.mesh
  }),
  
  
  position: [20, -40, -300]
})
sph.addTo(app)
scene.add(sph.native)

//const sliderPhysics = slider.use('physics');

// e.g. physics.applyCentralImpulse(v)
// applyImpulse
// applyTorque
// applyCentralForce
// applyForce
// setAngularVelocity
// setLinearVelocity
// setLinearFactor
// setDamping

//////////////////////////////////////
// Add the objects                   
//////////////////////////////////////

app.camera = camera;
const controls = new Controls(scene, app.camera, slider, false);


terrain.addTo(app)
.then(() => {
  // const helper = new THREE.FaceNormalsHelper(terrain.native)
  // scene.add(helper)
  scene.add(terrain.native)
  console.log(terrain.native)
  
  cube.addTo(app)
  slider.addTo(app);




  slider.on('collision',  (otherObject, v, r, contactNormal) => {
    //console.log({otherObject},v, r);
    let collided;
    if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
      collided = true;
      //console.log('collision!')
    }
  });


  firstPerson ? app.start() : staticApp.start()
  console.log({PHYSICS})

});

//////////////////////////////////////
// Loop and start              
//////////////////////////////////////


const gameLoop = new WHS.Loop((clock) => {
  if (firstPerson) {


  }

  controls.update(clock.getElapsedTime())


  camera.native.lookAt(new THREE.Vector3(0, -2000, -20000));


  timeDisplay.innerHTML = clock.getElapsedTime().toPrecision(3)

  //console.log(physics.getLinearVelocity())
  
})






//////////////////////////////////////
// Event Listeners                
//////////////////////////////////////

document.getElementById('reset').addEventListener('click',()=>{
  //app.stop();
  slider.position.set(-1, 0, 0);
  app.start();
})
document.getElementById('camera').addEventListener('click',()=>{
  firstPerson = !firstPerson;
  console.log(app, firstPerson, app.camera)

  firstPerson ? app.start() : staticApp.start()
})
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 32) {
    if (gameInProgress) {
      gameLoop.stop(app)
      app.stop(app)
    } else {

      gameLoop.start(app);
    }
    controls.enableTracking(!gameInProgress)

    gameInProgress = !gameInProgress;
  }
})


