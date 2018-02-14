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

import GameState from './GameState';

import DecalGeometry from './modules/DecalGeometry';


//////////////////////////////////////
// Setup app and three scene                  
//////////////////////////////////////

class App {

  constructor() {

    this.gameState = new GameState();

    this.scene = new THREE.Scene();
    let gameInProgress = false;
    this.gameInProgress = gameInProgress;
    let firstPerson = true;
    this.overLay = document.querySelector('#overLay');
    this.speedDisplay =  document.querySelector('#speedDisplay');
    this.timeDisplay =  document.querySelector('#timeDisplay');
    this.statusDisplay =  document.querySelector('#statusDisplay');
    this.bigDisplay = document.querySelector('#bigDisplay');
    this.bigDisplay.innerHTML = 'press space to start'


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
      .module(new WHS.ResizeModule())
      .module(new WHS.FogModule({color: 0xd6ddff, density: 0.0001}));
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


    // finally, do the thing:

    this.initWorld(gameInProgress, firstPerson);

  }

  //////////////////////////////////////
  // Add the objects                   
  //////////////////////////////////////

  initWorld = (gameInProgress, firstPerson) => {
    const { 
      app, 
      collisionStatus, 
      collidableMeshList, 
      camera, 
      finish, 
      fences, 
      terrainOuter, 
      centerLine, 
      track, 
      slider, 
      scene, 
      skybox, 
      lights, 
      clippingPlane,
    } = this;
    Promise.all([finish, fences, terrainOuter, centerLine, track, slider])
    .then(([finish, fences, terrainOuter, centerLine, track, slider ])=>{

    // name objects //
      [fences, terrainOuter, track].map(object => object.native.name = [object])

    // update slider params //
      if (!isDev) slider.native.visible = false;
      slider.native.castShadow = false;

    // add trees //
      const trees = new Trees(scene, terrainOuter.native);

      fences.native.material[0].transparent = true;

    // setup centerLine //
      if (isDev) {
        const vs = centerLine;
        const lineV = vs.filter(v => (v.y < 100))
        const lineGeo = new THREE.Geometry();
        lineGeo.vertices = vs;
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x0000ff,linewidth: 20, }));
        scene.add(line);
      }

    // setup gates //
      const gates = Gates(app, track.native.geometry.vertices);
      this.collidableMeshList = gates.map(gate => gate.getPortalObject())
    
    // do some collision handling //
      slider.on('collision',  (otherObject, v, r, contactNormal) => {
        if (otherObject.name !== 'track') this.collisionStatus = 'hit ' + otherObject.name;
        let collided;
        if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
          collided = true;
          //console.log('collision!',otherObject)
        }
      });

    // setup controls //
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

    // setup gameLoop //

      this.gameLoop = new WHS.Loop((clock) => {

        this.delta = clock.getElapsedTime();
    
        //if (this.firstPerson) 
        this.controls.update(this.delta);
    
        this.displayStatus(this.delta);
    
        this.detectGateCollisions(slider);
        
      })

    // add eventlisteners //

      this.addEventListeners(gameInProgress, firstPerson)
      app.start();
      this.worldModule.simulateLoop.stop();
    })
  }


  //////////////////////////////////////
  // other class methods             
  //////////////////////////////////////
  

  displayStatus = (delta) => {
    this.speedDisplay.innerHTML = parseInt(this.controls.displaySpeed());
    this.timeDisplay.innerHTML = delta.toFixed(2)
    this.statusDisplay.innerHTML = this.collisionStatus || '';

  }

  updateBigDisplay = (message) => {
    this.bigDisplay.innerHTML = message
  }

  detectGateCollisions = (slider) => {
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
      const collisionResults = ray.intersectObjects( this.collidableMeshList );
      if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
        const collidee = collisionResults[0].object.name;
        if (collidee === 'gate-finish') {
          return this.endGame();
        }

        console.log(" Hit ", collidee);
        this.collisionStatus = "Hit " + collidee
        this.gameState.setState({ [collidee]: this.delta })

      }
    })
  }

  endGame = () => {
    const { app, worldModule, gameLoop, controls } = this;
    const slowDownPeriod = 1000;
    setTimeout(() =>{
      worldModule.simulateLoop.stop();
      controls.enableTracking(false);
    }, slowDownPeriod)
    gameLoop.stop(app);

    this.gameState.setState({ finalTime: this.delta })

    console.log('gameState',this.gameState.getState())
    this.updateBigDisplay(`Finish: ${this.delta.toFixed(2)}`);
    this.overLay.classList = 'paused';

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

  addEventListeners = (gameInProgress, firstPerson) => {
    const { app, worldModule, gameLoop, controls } = this;
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 32) {
        console.log({ app, worldModule, gameLoop, controls })
        if (gameInProgress) {
          if (firstPerson) controls.enableTracking(false);
          worldModule.simulateLoop.stop();
          gameLoop.stop(app);
          this.updateBigDisplay('Paused');
          this.overLay.classList = 'paused';
        } else {
          if (firstPerson) controls.enableTracking(true);
          worldModule.simulateLoop.start();
          gameLoop.start(app);
          this.updateBigDisplay('')
          this.overLay.classList = '';
        }
        gameInProgress = !gameInProgress;
        console.log({gameInProgress})
      }
    })
  }

  // const getTerrainExtents = (lat, track) => {
  //   const vertices = track.geometry.vertices;
  //   const getLowest = (lat, vertices) => {
  //     return vertices.reduce((acc, curr) => ( 
  //       new THREE.Vector2(0, curr.z).distanceTo(new THREE.Vector2(0, lat)) <
  //           new THREE.Vector2(0, acc.z).distanceTo(new THREE.Vector2(0, lat))
  //       ? curr 
  //       : acc
  //     ));
  //   }
  //   return getLowest(lat, vertices)
  // }
  // console.log(getTerrainExtents(2000, track.native))

} // end class

new App();