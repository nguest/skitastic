import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from './modules/physics-module-2';
import APPCONFIG, { isDev, gateConfig } from './AppConfig';
import StatsModule from './modules/StatsModule';

import SkyBox from './components/Skybox';
import Terrain from './components/Terrain';
import Trees, { Tree } from './components/Trees';
import Fences from './components/Fences';
import Lights from './components/Lights';
import Slider from './components/Slider';
import Gates from './components/Gates';
import Finish from './components/Finish';
import Rocks from './components/Rocks';
import Misc from './components/Misc';
import Controls from './modules/Controls';
import GameState from './GameState';
import DecalGeometry from './modules/DecalGeometry';
import Label from './components/Label';
import { CanvasRenderer } from 'three';

class App {

  constructor() {

    this.gameState = new GameState();
    this.scene = new THREE.Scene();
    let gameInProgress = false;
    this.gameInProgress = gameInProgress;
    this.firstPerson = true;
    this.overLay = document.querySelector('#overLay');
    this.speedDisplay =  document.querySelector('#speedDisplay');
    this.timeDisplay =  document.querySelector('#timeDisplay');
    this.statusDisplay =  document.querySelector('#statusDisplay');
    this.bigDisplay = document.querySelector('#bigDisplay');
    this.bigDisplay.innerHTML = 'press space to start';
    this.gateDisplay = document.querySelector('#gateDisplay');

    this.intervalCounter = 0;

    if (!isDev) this.overLay.style.display = 'flex';

    let activeCamera = new WHS.DefineModule('camera',
      new WHS.PerspectiveCamera({
        position: new THREE.Vector3(0, 20, 0),
       // target: new THREE.Vector3(0, 300, 400),
        rotation: new THREE.Vector3(0, 0, 0),
        far: 25000,
        near: 0.1,
        fov: 45
      })
    );

  // create the whs app //
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
      .module(new WHS.FogModule({
        color: 0xd6ddff,
        color: 0xc3aaa7,
        density: 0.0004
      }));
    if (isDev) this.app.module(new StatsModule());

  // renderer shadow hack //
    this.app.modules[3].renderer.shadowMap.enabled = true;

  // setup clipping planes //
    this.clippingPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), APPCONFIG.clipDistance );
    this.app.modules[3].renderer.localClippingEnabled = true,
    this.app.modules[3].renderer.clippingPlanes = [ this.clippingPlane ]
    
    console.log({ta:this.app})

  // get the objects //               
    this.camera = this.app.manager.get('camera')
    this.skybox = new SkyBox(this.app, this.scene);
    this.slider = new Slider(this.app);
    [ this.track, this.terrainOuter, this.centerLine ] = new Terrain(this.app);
    [ this.fencesPhysics, this.fences ] = new Fences(this.app);  
    this.finish = new Finish(this.app); 
    this.rocks = new Rocks(this.app);
    this.lights = new Lights(this.app, this.scene);


  // finally, initialize the world //:
    this.initWorld(this.gameInProgress, this.firstPerson);

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
      fencesPhysics,
      terrainOuter, 
      centerLine, 
      track, 
      slider, 
      scene, 
      skybox, 
      lights, 
      clippingPlane,
      rocks
    } = this;

    Promise.all([finish, fences, fencesPhysics, terrainOuter, centerLine, track, slider, rocks])
    .then(([finish, fences, fencesPhysics, terrainOuter, centerLine, track, slider, rocks]) => {
      

    // name objects //
      [fences, terrainOuter, track].map(object => object.native.name = [object])

      console.log({t:track})

      //track.native.geometry = new THREE.BufferGeometry().fromGeometry(track.native.geometry)

    // setup track material
      track.native.material[0].normalMap = new THREE.TextureLoader().load('./assets/NormalMap.png', map => {
        map.wrapT = map.wrapS = THREE.RepeatWrapping;//RepeatWrapping
      });
      track.native.material[0].normalScale.set(0.3,0.3)
      track.native.material[0].side = THREE.FrontSide;
      track.native.material[0].specularMap = new THREE.TextureLoader().load('./assets/seamless-ice-snow-specular.png', map => {
        map.wrapT = map.wrapS = THREE.RepeatWrapping
      });
      track.native.material[0].displacementMap = new THREE.TextureLoader().load('./assets/seamless-ice-snow-displacement.png', map => {
        map.wrapT = map.wrapS = THREE.RepeatWrapping
        map.repeat.set(3,1)
      });
      track.native.material[0].displacementScale = 8

      console.log(track.native.material[0])

    // update slider params //
      if (!isDev) slider.native.visible = false;
      slider.native.castShadow = false;

    // setup trees //
      const trees = new Trees(scene, terrainOuter.native);

      const label = new Label();
      label.addTo(this.app)

    // setup fences //
      fences.native.material[0].transparent = true;
      fencesPhysics.native.visible = false;
      fences.native.material[0].map.wrapT = THREE.ClampToEdgeWrapping
      fences.native.material[0].map.repeat.set(1,1)
      //fences.native.visible = false;//destroy()

    // setup centerLine //
      centerLine.native.visible = false;

    // setup gates //
      const gates = Gates(app, centerLine.native.geometry.vertices, track.native);
      this.collidableMeshList = gates.map(gate => gate.getPortalObject())
    
    // do some collision handling //
      slider.on('collision',  (otherObject, v, r, contactNormal) => {
        if (typeof otherObject.name === 'string') this.collisionStatus = 'hit ' + otherObject.name;
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
    
        if (firstPerson) this.controls.update(this.delta);
    
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
    this.updateDisplay('speed', parseInt(this.controls.displaySpeed() * 0.25));
    this.updateDisplay('status', this.collisionStatus || '')

    const time =
      delta
      .toFixed(2)
      .padStart(5, '0')
      .replace(/./g, c => (
        `<span>${String.fromCharCode(c.charCodeAt(0))}</span>`
      ));
    this.updateDisplay('time', time);
  }

  updateDisplay = (displayType, message, timeOut) => {

    this[`${displayType}Display`].innerHTML = message;



    //   console.log(this.    this[`${displayType}Display`].innerHTML = message
    // )
    //   this.intervalCounter == ;
    //   if (this.intervalCounter >= timeOut/60){
    //     this[`${displayType}Display`].innerHTML = '';
    //     this.intervalCounter = 0;
    //   }
    // }
  }

  detectGateCollisions = (slider) => {
  // collision detection:

    const sliderMesh = slider.native;
    const originPoint = sliderMesh.position.clone();
    
    sliderMesh.geometry.vertices.map(vertex => {
      const localVertex = vertex.clone();
      const globalVertex = localVertex.applyMatrix4(sliderMesh.matrix);
      const directionVector = globalVertex.sub(sliderMesh.position);
      
      const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      const collisionResults = ray.intersectObjects(this.collidableMeshList);
      if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
        const collidee = collisionResults[0].object.name;
        if (collidee === 'gate-finish') {
          return this.endGame();
        }

        console.log(" Hit ", collidee);
        this.collisionStatus = "Hit " + collidee
        this.gameState.setState({ [collidee]: this.delta })

      }
    })
    gateConfig.map((gate,idx) => {
      // look if a gate is recorded in gameState
      const gateState = this.gameState.getState()[`gate-${idx}`]

      if (originPoint.z < gate.z - 50) {
        // if miss
        if (!gateState) {
          this.gameState.setState({ [`gate-${idx}`]: null })
        }

        // display gateStatus
        const stateValues = Object.values(this.gameState.getState())

        if (!stateValues[stateValues.length - 1]) {
          this.updateDisplay('big', 'Oops! Missed a gate', 2000);
        } else {
          this.updateDisplay('big', 'Passed Gate!', 2000);
        }
        const gateStatus = stateValues.map(value => {
          if (value) return 'x';
          return 'o';
        })
        this.updateDisplay('gate', gateStatus.join(''))
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
    const missedGatesNumber =
      Object.values(this.gameState.getState())
      .filter(value => value === null)
      .length
    this.updateDisplay('big',`Finish: ${this.delta.toFixed(2)}: missed ${missedGatesNumber}`);
    if (isDev === false) this.overLay.classList = 'paused';
  }

  //////////////////////////////////////
  // Event Listeners                
  //////////////////////////////////////

  addEventListeners = (gameInProgress, firstPerson) => {
    const { app, worldModule, gameLoop, controls } = this;
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 32) {
        console.log({ app, worldModule, gameLoop, controls })
        if (gameInProgress) {
          if (firstPerson) controls.enableTracking(false);
          worldModule.simulateLoop.stop();
          gameLoop.stop(app);
          this.updateDisplay('big','Paused');
          if (isDev === false) this.overLay.classList = 'paused';
        } else {
          if (firstPerson) controls.enableTracking(true);
          worldModule.simulateLoop.start();
          gameLoop.start(app);
          this.updateDisplay('big','')
          this.overLay.classList = '';
        }
        gameInProgress = !gameInProgress;
        console.log({gameInProgress})
      }
    })
  }

} // end class

new App();