import * as THREE from 'three';
import APPCONFIG from './AppConfig';
import * as WHS from 'whs';
import * as PHYSICS from './modules/physics-module-2';
import StatsModule from './modules/StatsModule';
import SkyBox from './components/Skybox';
import Terrain from './components/Terrain';
import Trees from './components/Trees';
import Fences from './components/Fences';

import Lights from './components/Lights';
import Slider from './components/Slider';
import Gates from './components/Gates';

import Misc from './components/Misc';
import Controls from './modules/Controls';


//////////////////////////////////////
// Setup app and three scene                  
//////////////////////////////////////

const scene = new THREE.Scene();

let firstPerson = true;
let gameInProgress = false;
const speedDisplay =  document.querySelector('#speedDisplay');

let activeCamera = new WHS.DefineModule('camera',
  new WHS.PerspectiveCamera({
    position: new THREE.Vector3(0, 20, 0),
    target: new THREE.Vector3(0, -20, 400),
    rotation: new THREE.Vector3(0, 0, 0),
    far: 25000,
    near: 0.1,
    fov: 35,
  })
);

const worldModule = new PHYSICS.WorldModule(APPCONFIG.appDefaults.physics);

const app = new WHS.App([
  new WHS.ElementModule(),
  new WHS.SceneModule(),
  activeCamera,
]);


app.setScene(scene);

app
  .module(
    new WHS.RenderingModule({ 
    ...APPCONFIG.appDefaults.rendering, 
    shadow: true,
    shadowMap: { enabled: true},
    bgColor: 0xaaddff,
    }),
  )
  .module(worldModule)
  .module(new WHS.OrbitControlsModule())
  .module(new WHS.ResizeModule())
  .module(new StatsModule())

// renderer shadow hack
app.modules[3].renderer.shadowMap.enabled = true;

//////////////////////////////////////
// Get the objects                   
//////////////////////////////////////


const camera = app.manager.get('camera')
const skybox = new SkyBox(app, scene);
const slider = Slider();
const terrain = Terrain();
const fences = Fences();

const trees = Trees();
const lights = new Lights(app, scene);
const timeDisplay = document.querySelector('#timeDisplay');
console.log(lights.getShadowCamera())

const misc = Misc(app)


//////////////////////////////////////
// Add the objects                   
//////////////////////////////////////

const initWorld = () => {
  terrain.addTo(app)
  .then(() => {
    fences.map(fence => fence.addTo(app))
    //fences.native.name = 'fence';
  })
  .then(() => trees.addTo(app))
  .then(() => {
    trees.native.material.transparent = true;

    terrain.native.name = 'terrain';
    console.log(terrain.native.material)

    console.log({scene})

    slider.addTo(app)
    const gates = Gates(app, terrain.native.geometry.vertices);
    //slider.addTo(app);
  
    slider.on('collision',  (otherObject, v, r, contactNormal) => {
      console.log(otherObject.name);
      let collided;
      if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
        collided = true;
        //console.log('collision!',otherObject)
      }
    });
  
    collidableMeshList = gates.map(gate => gate.getPortalObject())
  
    app.start();
    worldModule.simulateLoop.stop();
  });
}

app.camera = camera;
let controls;
if (firstPerson) {
  controls = new Controls({
    scene, 
    camera: app.camera, 
    mesh: slider, 
    skybox: skybox.getCube(),
    enabled: false,
    light: lights.getDLight()
  });
}

let collidableMeshList = [];
let collisionStatus = '';
initWorld();



//////////////////////////////////////
// Loop and start              
//////////////////////////////////////


const gameLoop = new WHS.Loop((clock) => {

  const delta = clock.getElapsedTime();

  if (firstPerson) controls.update(delta);

  //camera.native.lookAt(new THREE.Vector3(0, -2000, -20000));

  displayStatus(delta);

  detectGateCollisions();
  
})

const displayStatus = (delta) => {
  speedDisplay.innerHTML = parseInt(controls.displaySpeed());
  timeDisplay.innerHTML = delta.toFixed(2)
  statusDisplay.innerHTML = collisionStatus;

}

const detectGateCollisions = () => {
// collision detection:
	//   determines if any of the rays from the cube's origin to each vertex
	//		intersects any face of a mesh in the array of target meshes
	//   for increased collision accuracy, add more vertices to the cube;
	//		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
  //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
  const sliderMesh = slider.native;
  const originPoint = sliderMesh.position.clone();
  
  sliderMesh.geometry.vertices.map(vertex => {
    const localVertex = vertex.clone();
		const globalVertex = localVertex.applyMatrix4( sliderMesh.matrix );
		const directionVector = globalVertex.sub( sliderMesh.position );
		
		const ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
		const collisionResults = ray.intersectObjects( collidableMeshList );
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
      console.log(" Hit ", collisionResults[0].object.name);
      collisionStatus = " Hit " + collisionResults[0].object.name
    }
  })
}





//////////////////////////////////////
// Event Listeners                
//////////////////////////////////////

document.getElementById('reset').addEventListener('click',()=>{
  worldModule.simulateLoop.stop()
  gameLoop.stop(app)
  slider.position.set(-1, 0, 0);
  worldModule.simulateLoop.start()
  gameLoop.start(app)
})
document.getElementById('camera').addEventListener('click',()=>{
  firstPerson = !firstPerson;
  console.log(app, firstPerson, app.camera)

  app.start();
})
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 32) {

    if (gameInProgress) {
      worldModule.simulateLoop.stop()
      gameLoop.stop(app)
    } else {
      if (firstPerson) controls.enableTracking(true)
      worldModule.simulateLoop.start()
      gameLoop.start(app);
    }
    gameInProgress = !gameInProgress;
    console.log({gameInProgress})

    //controls.enableTracking(!gameInProgress)

    
  }
})
