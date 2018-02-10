import * as THREE from 'three';
import APPCONFIG, { isDev } from './AppConfig';
import * as WHS from 'whs';
import * as PHYSICS from './modules/physics-module-2';
import StatsModule from './modules/StatsModule';
import SkyBox from './components/Skybox';
import Terrain from './components/Terrain';
import Trees, { Tree } from './components/Trees';
import Fences from './components/Fences';

import Lights from './components/Lights';
import Slider from './components/Slider';
import Gates from './components/Gates';
import Finish from './components/Finish';

import Misc from './components/Misc';
import Controls from './modules/Controls';

import DecalGeometry from './modules/DecalGeometry';


//////////////////////////////////////
// Setup app and three scene                  
//////////////////////////////////////

const gameState = {

}

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
      localClippingEnabled: true,
    }),
  )
  .module(worldModule)
  .module(new WHS.OrbitControlsModule())
  .module(new WHS.ResizeModule());
if (isDev) app.module(new StatsModule());

// renderer shadow hack
app.modules[3].renderer.shadowMap.enabled = true;

// clipping planes
const clippingPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), APPCONFIG.clipDistance );

app.modules[3].renderer.localClippingEnabled = true,
app.modules[3].renderer.clippingPlanes = [clippingPlane]
console.log({app})


let controls;
let collidableMeshList = [];
let collisionStatus = '';

//////////////////////////////////////
// Get the objects                   
//////////////////////////////////////


const camera = app.manager.get('camera')
const skybox = new SkyBox(app, scene);
const slider = Slider();
const [track, terrainOuter, centerLine] = new Terrain(app);
const fences = Fences();
const finish = new Finish();
const lights = new Lights(app, scene);
const timeDisplay = document.querySelector('#timeDisplay');

//////////////////////////////////////
// Add the objects                   
//////////////////////////////////////

const initWorld = (controls) => {
  finish.addTo(app)
  //.then(() => centerLine.addTo(app))
  .then(() => terrainOuter.addTo(app))
  .then(() => fences.addTo(app))
  .then(() => slider.addTo(app))
  .then(() => track.addTo(app))
  .then((track) => {
    track.native.name = 'track';
    const getTerrainExtents = (lat, track) => {
      const vertices = track.geometry.vertices;
      const getLowest = (lat, vertices) => {
        return vertices.reduce((acc, curr) => ( 
          new THREE.Vector2(0, curr.z).distanceTo(new THREE.Vector2(0, lat)) <
              new THREE.Vector2(0, acc.z).distanceTo(new THREE.Vector2(0, lat))
          ? curr 
          : acc
        ));
      }
      return getLowest(lat, vertices)
    }
    console.log(getTerrainExtents(2000, track.native))

    var geometry =  new DecalGeometry( track.native, new THREE.Vector3(0,0,0), new THREE.Euler(0, 1, 0, 'XYZ' ), new THREE.Vector3( 100, 100, 100 ));
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var mesh = new THREE.Mesh( geometry, material );
   // scene.add( mesh );

    const trees = new Trees(scene, terrainOuter.native);

    fences.native.material[0].transparent = true;
    fences.native.name = 'fence';

    const vs = centerLine;
    const lineV = vs.filter(v => (v.y < 100))
    const lineGeo = new THREE.Geometry();
    lineGeo.vertices = vs;
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x0000ff,linewidth: 20, }));
    if (isDev) scene.add(line);
  })
  .then(() => {

    console.log({track})    
    console.log({scene})


    const gates = Gates(app, track.native.geometry.vertices);
  
    slider.on('collision',  (otherObject, v, r, contactNormal) => {
      console.log(otherObject.name);
      if (otherObject.name !== 'track') collisionStatus = 'hit ' + otherObject.name
      let collided;
      if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
        collided = true;
        //console.log('collision!',otherObject)
      }
    });
    
    console.log({controls})

   // controls.track = track;

  
    collidableMeshList = gates.map(gate => gate.getPortalObject())
  
    app.start();
    worldModule.simulateLoop.stop();
  });
}

initWorld(controls);
app.camera = camera;
if (firstPerson) {
  controls = new Controls({
    scene, 
    camera: app.camera, 
    mesh: slider,
    //track,
    skybox: skybox.getCube(),
    enabled: false,
    light: lights.getDLight(),
    clippingPlane,
  });
}


//////////////////////////////////////
// Loop and start              
//////////////////////////////////////


const gameLoop = new WHS.Loop((clock) => {

  const delta = clock.getElapsedTime();

  if (firstPerson) controls.update(delta);

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

// document.getElementById('reset').addEventListener('click',()=>{
//   worldModule.simulateLoop.stop()
//   gameLoop.stop(app)
//   slider.position.set(-1, 0, 0);
//   worldModule.simulateLoop.start()
//   gameLoop.start(app)
// })
// document.getElementById('camera').addEventListener('click',()=>{
//   ///firstPerson = !firstPerson;
//   console.log(app, firstPerson, app.camera)
//   slider.position.set(-400,-6000,-20000)
//   app.start();
// })
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 32) {

    if (gameInProgress) {
      worldModule.simulateLoop.stop();
      gameLoop.stop(app);
    } else {
      if (firstPerson) controls.enableTracking(true);
      worldModule.simulateLoop.start();
      gameLoop.start(app);
    }
    gameInProgress = !gameInProgress;
    console.log({gameInProgress})

    //controls.enableTracking(!gameInProgress)

    
  }
})
