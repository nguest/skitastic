import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import { gateConfig } from '../AppConfig';
import Label from './Label';
import { Vertex } from 'three';

// reduces to a 3d object with x,y,z
const makeGatePosition = (goal, vertices) => {
  return vertices.reduce((acc, curr) => ( 
    new THREE.Vector2(curr.x, curr.z).distanceTo(new THREE.Vector2(goal.x, goal.z)) < 
        new THREE.Vector2(acc.x, acc.z).distanceTo(new THREE.Vector2(goal.x, goal.z))
    ? curr 
    : acc
  ));
}

const getGateOuterPoints = (centerPoint, track) => {
  
  const directionVector = new THREE.Vector3(0,-1,0)
  const offset = 100;
  const leftRayOrigin = new THREE.Vector3(centerPoint.x -50, centerPoint.y + offset, centerPoint.z)
  const rightRayOrigin = new THREE.Vector3(centerPoint.x +50, centerPoint.y + offset, centerPoint.z)

  let leftOffsetY = 0;
  let rightOffsetY = 0;
  const leftRay = new THREE.Raycaster( leftRayOrigin, directionVector.clone() );
  const collisionResultsL = leftRay.intersectObject( track );
  if ( collisionResultsL.length > 0 && collisionResultsL[0] ) {
    const collisionPointL = collisionResultsL[0].point;
    leftOffsetY = collisionPointL.y - centerPoint.y  ;
  }
  const rightRay = new THREE.Raycaster( rightRayOrigin, directionVector.clone() );
  const collisionResultsR = rightRay.intersectObject( track );
  if ( collisionResultsR.length > 0 && collisionResultsR[0] ) {
    const collisionPointR = collisionResultsR[0].point;
    rightOffsetY = collisionPointR.y - centerPoint.y  ;
  }
  return { leftOffsetY, rightOffsetY }

}

const getCenterlinePoint = (goal, vertices) => {
  return vertices.reduce((acc, curr) => ( 
    new THREE.Vector2(0, curr.z).distanceTo(new THREE.Vector2(0, goal.z)) < 
        new THREE.Vector2(0, acc.z).distanceTo(new THREE.Vector2(0, goal.z))
    ? curr 
    : acc
  ));
}

const Gates = (app, vertices, track) => {
  // make array of actual gate positions on terrain surface
  //const gatePositions = gateConfig.map(gate => makeGatePosition(gate, vertices)) 
  const gatePositions = gateConfig.map(gate => {

    const centerPoint = getCenterlinePoint(gate, vertices)
    const outerPoints = getGateOuterPoints(centerPoint, track)
    console.log(outerPoints)

    return { centerPoint, outerPoints };

  })
 // console.log(gatePositions)
  // create gates
  const gates = gatePositions.map((gate, idx, array) => 
    new Gate({ app, 
      position: gate.centerPoint, 
      outerPoints: gate.outerPoints,
      w: gateConfig[idx].w, 
      idx, 
      array
    }) 
  )
  return gates;
}

class Gate {

  constructor({ app, position, outerPoints, w, idx, array }) {
    this.app = app;
    this.position = position;
    this.width = w;
    this.idx = idx;
    this.array = array;
    this.outerPoints = outerPoints;
console.log({outerPoints})

    //console.log({ app, position, w })

    this.params = {
      gateHeight: 60,
      poleHeight: 50,
      poleWidth: 15,
      poleDepth: 2,
    }
    this.createPortal(app);
    this.createPoles(app);
    this.createLabel(app);
  }

  createPortal = (app) => {
    const portalMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaabb,
      transparent: true,
      ///opacity: 0.15,
      wireframe: true,
    })

    this.portal = new WHS.Plane({
      geometry: {
        width: this.width,
        height: this.params.gateHeight
      },

      // modules: [
      //   new PHYSICS.BoxModule({
      //     mass: 0,
      //     mask: 1,
      //     group: 1,
      //   })
      // ],
  
      material: portalMaterial,

      position: [this.position.x, this.position.y + 20, this.position.z],

    })
    if (this.idx === this.array.length - 1) {
      this.portal.native.name = 'gate-finish';
    } else {
      this.portal.native.name = 'gate-' + this.idx
    }
    
    this.portal.addTo(app)
  }


  getPortalObject() {
    return this.portal.native;
  }

  createPoles = (app) => {
    const poleMaterial = new THREE.MeshPhongMaterial({
      //color: 0xffaabb,
      map: new THREE.TextureLoader().load('./assets/textures/flag.png'),
      transparent: true,
      shininess: 100,
      //emissive: 0x222222,
      specular: 0x666666,
    })

    const geometry = {
      width: this.params.poleWidth, 
      height: this.params.poleHeight, 
      depth: this. params.poleDepth
    }
    const rotation = [
      0,0,0//Math.PI,
    ]

    const modules = [
      new PHYSICS.BoxModule({
        mass: 0,
        restitution: 0.3,
        friction: 1,
      })
    ];

    const shadow = {
      cast: true,
      receive: true
    };


    const poleL = new WHS.Plane({
      geometry,
      position: [
        this.position.x - (this.width + this.params.poleWidth)/2,
        this.position.y + 25 + this.outerPoints.leftOffsetY,
        this.position.z + 20,
      ],
      rotation,
      modules,
      material: poleMaterial,
      shadow,
    })
    const poleR = new WHS.Plane({
      geometry,
      rotation,
      position: [
        this.position.x + (this.width + this.params.poleWidth)/2,
        this.position.y + 25 + this.outerPoints.rightOffsetY,
        this.position.z + 20,
      ],
      modules,
      material: poleMaterial,
      shadow,
    });
    poleL.native.name = poleR.native.name = 'pole';
    poleL.addTo(app);
    poleR.addTo(app);
  }

  createLabel = (app) => {
    const labelDisplace = new Label({
      text: this.idx,
      size: 30,
      scale: [100, 100, 1],
      position: [this.position.x, this.position.y + 30, this.position.z]
    }).addTo(app);
  }
}

export default Gates;