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

class App {

  constructor() {

    const gameState = {

    }

    this.scene = new THREE.Scene();
    let gameInProgress = false;
    this.gameInProgress = gameInProgress;
    let firstPerson = true;
    this.speedDisplay =  document.querySelector('#speedDisplay');

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

    this.worldModule = new PHYSICS.WorldModule(APPCONFIG.appDefaults.physics);

    this.app = new WHS.App([
      new WHS.ElementModule(),
      new WHS.SceneModule(),
      activeCamera,
    ]);
    this.app.setScene(this.scene);
    this.app
      .module(
        new WHS.RenderingModule({ 
          ...APPCONFIG.appDefaults.rendering, 
          shadow: true,
          shadowMap: { enabled: true},
          bgColor: 0xaaddff,
          localClippingEnabled: true,
        }),
      )
      .module(this.worldModule)
      .module(new WHS.OrbitControlsModule())
      .module(new WHS.ResizeModule());
    if (isDev) this.app.module(new StatsModule());

    // renderer shadow hack
    this.app.modules[3].renderer.shadowMap.enabled = true;

    // clipping planes
    this.clippingPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), APPCONFIG.clipDistance );

    this.app.modules[3].renderer.localClippingEnabled = true,
    this.app.modules[3].renderer.clippingPlanes = [ this.clippingPlane ]
    console.log({ta:this.app})

    //this.controls;


    //////////////////////////////////////
    // Get the objects                   
    //////////////////////////////////////


    this.camera = this.app.manager.get('camera')
    this.skybox = new SkyBox(this.app, this.scene);
    this.slider = new Slider(this.app);
    [ this.track, this.terrainOuter, this.centerLine ] = new Terrain(this.app);
    this.fences = Fences(this.app);  
    this.finish = new Finish(this.app); 
    this.lights = new Lights(this.app, this.scene);
    this.timeDisplay = document.querySelector('#timeDisplay');

    // finally, do the thing:

    this.initWorld(gameInProgress, firstPerson);

  }

  //////////////////////////////////////
  // Add the objects                   
  //////////////////////////////////////

  initWorld = (gameInProgress, firstPerson) => {
    const { app, collisionStatus, collidableMeshList, camera, finish, fences, terrainOuter, centerLine, track, slider, scene, skybox, lights, clippingPlane } = this;
    Promise.all([finish, fences, terrainOuter, centerLine, track, slider])
    .then(([finish, fences, terrainOuter, centerLine, track, slider ])=>{
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

      console.log({sl:slider})


      const gates = Gates(app, track.native.geometry.vertices);
    
      slider.on('collision',  (otherObject, v, r, contactNormal) => {
        console.log(otherObject.name);
        if (otherObject.name !== 'track') this.collisionStatus = 'hit ' + otherObject.name
        let collided;
        if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
          collided = true;
          //console.log('collision!',otherObject)
        }
      });

      

      this.collidableMeshList = gates.map(gate => gate.getPortalObject())
      if (firstPerson) {
        this.controls = new Controls({
          scene, 
          camera, 
          mesh: slider,
          track,
          skybox: skybox.getCube(),
          enabled: true,
          light: lights.getDLight(),
          clippingPlane,
        });
      }

    })
    .then(() => {

      this.addEventListeners(gameInProgress, firstPerson)

      app.start();
      this.worldModule.simulateLoop.stop();
      //this.gameLoop;//.execute(app);
    })
  }




  //////////////////////////////////////
  // Loop and start              
  //////////////////////////////////////

  // get gameInProgress() {
  //   return false
  // }

  // set gameInProgress() {
  //   return false
  // }


  gameLoop = new WHS.Loop((clock) => {

    const delta = clock.getElapsedTime();

    //if (this.firstPerson) 
    this.controls.update(delta);

    this.displayStatus(delta);

   //this.detectGateCollisions();
    
  })

  displayStatus = (delta) => {
    this.speedDisplay.innerHTML = parseInt(this.controls.displaySpeed());
    //timeDisplay.innerHTML = delta.toFixed(2)
   // statusDisplay.innerHTML = this.collisionStatus;

  }

  detectGateCollisions = () => {
  // collision detection:
    //   determines if any of the rays from the cube's origin to each vertex
    //		intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    const sliderMesh = this.slider.native;
    console.log({t: this.slider.native})
    const originPoint = sliderMesh.position.clone();
    
    sliderMesh.geometry.vertices.map(vertex => {
      const localVertex = vertex.clone();
      const globalVertex = localVertex.applyMatrix4( sliderMesh.matrix );
      const directionVector = globalVertex.sub( sliderMesh.position );
      
      const ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
      const collisionResults = ray.intersectObjects( this.collidableMeshList );
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
  addEventListeners = (gameInProgress, firstPerson) => {
    const { app, worldModule, gameLoop, controls } = this;
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 32) {
        console.log({ app, worldModule, gameLoop, controls })
        if (gameInProgress) {
          if (firstPerson) controls.enableTracking(false);
          worldModule.simulateLoop.stop();
          gameLoop.stop(app);
        } else {
          if (firstPerson) controls.enableTracking(true);
          //worldModule.simulateLoop.start();
          app.modules[4].simulateLoop.start();
          gameLoop.start(app);
        }
        gameInProgress = !gameInProgress;
        console.log({gameInProgress})

        //controls.enableTracking(!gameInProgress)

        
      }
    })
  }

} // end class

new App()