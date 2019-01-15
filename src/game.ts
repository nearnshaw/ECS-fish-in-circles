// const point1 = new Vector3(2, 3, 3.5)
// const point2 = new Vector3(5, 3, 2)
// const point3 = new Vector3(8, 4, 2)
// const point4 = new Vector3(9, 5, 5)
// const point5 = new Vector3(8, 6, 9)
// const point6 = new Vector3(6, 5, 8)
// const point7 = new Vector3(2, 3, 7)
//const myPath: Vector3[] = [point1, point2, point3, point4, point5, point6, point7])


const point1 = new Vector3(4, 3, 3)
const curvePoint1 = new Vector3(5, 3.5, 0)
const point2 = new Vector3(8, 4, 2)
const curvePoint2 = new Vector3(10, 5, 5)
const point3 = new Vector3(8, 6, 8)
const curvePoint3 = new Vector3(5, 4.5, 10)
const point4 = new Vector3(2, 2, 7)
const curvePoint4 = new Vector3(0, 3, 4.5)

// curve experiments
//let curve = new BezierCurve()
//BezierCurve.Interpolate()
let curvePoints = 100

// Cuadratic Beizer
let c = Curve3.CreateQuadraticBezier(point1, curvePoint1, point2, curvePoints)
let c2 = Curve3.CreateQuadraticBezier(point2, curvePoint2, point3, curvePoints)
let c3 = Curve3.CreateQuadraticBezier(point3, curvePoint3, point4, curvePoints)
let c4 = Curve3.CreateQuadraticBezier(point4, curvePoint4, point1, curvePoints)

let beizerPath: Vector3[] =[]
// myPath.push(...c.getPoints())
// myPath.push(...c2.getPoints())
// myPath.push(...c3.getPoints())
// myPath.push(...c4.getPoints())

beizerPath = c.continue(c2).continue(c3).continue(c4).getPoints()

log("curve points ", beizerPath)

// Hermite spline
let start = new Vector3(12, 1, 12)
let end = new Vector3(19, 1, 19)
let hermitePath = Curve3.CreateHermiteSpline(start, Vector3.Up(), end, Vector3.Down(), curvePoints).getPoints()

// Catmull-Rom Spline
const cpoint1 = new Vector3(14, 3, 3)
const cpoint2 = new Vector3(18, 4, 2)
const cpoint3 = new Vector3(18, 6, 8)
const cpoint4 = new Vector3(12, 2, 7)
const cpoints = [cpoint1, cpoint2, cpoint3, cpoint4]

let catmullPath = Curve3.CreateCatmullRomSpline(cpoints, curvePoints, true).getPoints()

@Component("pathData")
export class PathData {
  posIndex: number = 0
  nextPosIndex: number = 1
  path: Vector3[] = beizerPath
  fraction: number = 0
  constructor(path: Vector3[]){
    this.path = path
  }
}

// component group of all sharks
export const fish = engine.getComponentGroup(PathData)

// @Component("rotateData")
// export class RotateData {
//   previousRot: Quaternion
//   targetRot: Quaternion
//   rotateFraction: number = 0
// }

@Component("swimSpeed")
export class SwimSpeed {
  speed: number = 0.5
  //effort: number = 0.5
}



export class PatrolPath {
  update() {
    for (let shark of fish.entities){

      let transform = shark.get(Transform)
      let path = shark.get(PathData)
      let speed = shark.get(SwimSpeed)
      if (path.fraction < 1) {
        transform.position = Vector3.Lerp(
          path.path[path.posIndex],
          path.path[path.nextPosIndex],
          path.fraction
          )
        path.fraction += speed.speed // / 4
      } else {
        path.posIndex = path.nextPosIndex
        path.nextPosIndex += 1
        if (path.nextPosIndex >= path.path.length) {
          path.nextPosIndex = 0
        }
        path.fraction = 0
        transform.lookAt(path.path[path.posIndex+1])
      }  
    }
  }
}

engine.addSystem(new PatrolPath())

export class UpdateSpeed {
  update() {
    for (let shark of fish.entities){
      let speed = shark.get(SwimSpeed)
      let path = shark.get(PathData)
      let depthDiff = (path.path[path.nextPosIndex].y - path.path[path.posIndex].y) * curvePoints
      if (depthDiff > 1){
        depthDiff = 1
      } else if (depthDiff < -1){
        depthDiff = -1
      }
      depthDiff += 1.5   // from 0.5 to 2.5
    
      let clipSwim = shark.get(GLTFShape).getClip("swim")
      clipSwim.speed = depthDiff
      clipSwim.weight = depthDiff
      
      speed.speed = ((depthDiff * -1) + 3) // from 2.5 to 0.5
      //log("dd :" , depthDiff, " speed: " , speed.speed)
    }
  }
}

engine.addSystem(new UpdateSpeed())


// export class RotateSystem {
//   update() {
//     let transform = shark.get(Transform)
//     let path = shark.get(PathData)
//     let rotate = shark.get(RotateData)
//     if (path.fraction < 0.5) {
//       rotate.rotateFraction = path.fraction + 0.5
//       rotate.targetRot = fromToRotation(path.path[path.posIndex], path.path[path.posIndex+1])
//     } else {
//       rotate.rotateFraction = path.fraction - 0.5
//       rotate.targetRot = fromToRotation(path.path[path.posIndex+1], path.path[path.posIndex+2] )
//     }
//     transform.rotation = Quaternion.Slerp(
//       rotate.previousRot,
//       rotate.targetRot,
//       rotate.rotateFraction
//     )
   
//     //Quaternion.LookRotation(forward)
    
//     //rotate.previousRot = transform.rotation
//     //rotate.targetRot = fromToRotation(rotate.previousRot, path.target)
//   }
// }

// engine.addSystem(new RotateSystem())



// Shark 1 (Beizer)
let shark1 = new Entity()
shark1.set(new Transform({
  position: new Vector3(5, 3, 5),
  scale: new Vector3(0.5, 0.5, 0.5)
}))
shark1.set(new GLTFShape("models/shark.gltf"))

// Add animations
const clipSwim1 = new AnimationClip("swim", {speed: 0.5, weight: 0.5})
shark1.get(GLTFShape).addClip(clipSwim1)

// Activate swim animation
clipSwim1.play()

// add a path data component
shark1.set(new PathData(beizerPath))
//shark.set(new RotateData())
shark1.set(new SwimSpeed())
shark1.get(Transform).lookAt(shark1.get(PathData).path[1])

// Add shark to engine
engine.addEntity(shark1)


// Add Shark  2 (Hermite Spline)
let shark2 = new Entity()
shark2.set(new Transform({
  position: new Vector3(1, 0, 1),
  scale: new Vector3(0.5, 0.5, 0.5)
}))
shark2.set(new GLTFShape("models/shark.gltf"))

// Add animations
const clipSwim2 = new AnimationClip("swim", {speed: 0.5, weight: 0.5})
shark2.get(GLTFShape).addClip(clipSwim2)

// Activate swim animation
clipSwim2.play()

// add a path data component
shark2.set(new PathData(hermitePath))
//shark.set(new RotateData())
shark2.set(new SwimSpeed())
shark2.get(Transform).lookAt(shark2.get(PathData).path[1])

// Add shark to engine
engine.addEntity(shark2)




// Add Shark  3 (Catmull-Rom Spline)
let shark3 = new Entity()
shark3.set(new Transform({
  position: new Vector3(1, 0, 1),
  scale: new Vector3(0.5, 0.5, 0.5)
}))
shark3.set(new GLTFShape("models/shark.gltf"))

// Add animations
const clipSwim3 = new AnimationClip("swim", {speed: 0.5, weight: 0.5})
shark3.get(GLTFShape).addClip(clipSwim3)

// Activate swim animation
clipSwim3.play()

// add a path data component
shark3.set(new PathData(catmullPath))
//shark.set(new RotateData())
shark3.set(new SwimSpeed())
shark3.get(Transform).lookAt(shark2.get(PathData).path[1])

// Add shark to engine
engine.addEntity(shark3)




///////////////

// Add 3D model for scenery
const seaBed = new Entity()
seaBed.add(new GLTFShape("models/Underwater_Example.gltf"))
seaBed.add(new Transform({
  position: new Vector3(5, 0, 5),
  rotation: Quaternion.Euler(0, 180, 0),
  scale: new Vector3(0.5, 0.5, 0.5)

}))
engine.addEntity(seaBed)




function fromToRotation(from: Vector3, to: Vector3): Quaternion {
  const result = new Quaternion()
  let v0 = from.normalizeToNew()
  let v1 = to.normalizeToNew()
  let d = Vector3.Dot(v0, v1)

  if (d > -1 + Epsilon) {
    let s = Math.sqrt((1 + d) * 2)
    let invs = 1 / s
    let c = Vector3.Cross(v0, v1).scaleInPlace(invs)
    result.set(c.x, c.y, c.z, s * 0.5)
  } else if (d > 1 - Epsilon) {
    return new Quaternion(0, 0, 0, 1)
  } else {
    let axis = Vector3.Cross(Vector3.Right(), v0)

    if (axis.lengthSquared() < Epsilon) {
      axis = Vector3.Cross(Vector3.Forward(), v0)
    }

    result.set(axis.x, axis.y, axis.z, 0)
  }

  return result.normalize()
}