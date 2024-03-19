"use client"


import { CameraControls, Environment, Gltf, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Teacher } from "./Teacher";
import { degToRad } from "three/src/math/MathUtils";

export const Experience = () => {
    return (
        <>  
            {/* Setting the camera as first person  */}
            <Canvas camera={{
                position: [0,0, 0.0001],
            }}>
                {/* <OrbitControls/> */}

                <CameraManager />
                <Environment preset="sunset"/>
                <ambientLight intensity={0.8} color="pink" />
                <Teacher 
                    teacher={"Nanami"} 
                    position={[-1, -1.7, -3]}
                    scale={1.5}
                    rotation-y={degToRad(20)}
                />
                <Gltf src="/models/classroom_default.glb" position={[0.2, -1.7, -2]}/>
            </Canvas>
        </>
    )
}

// Where transitions happens
const CameraManager = () => {
    return(
        <CameraControls
            minZoom={1}
            maxZoom={3}
            polarRotateSpeed={-0.3}
            azimuthRotateSpeed={-0.3}
            mouseButtons={{
                left: 1,     // ACTION_ROTATE
                wheel: 16,   // ACTION_ZOOM
            }}
            touches={{
                one: 32,    // ACTION.TOUCH_ROTATE
                two: 512,   // ACTION.TOUCH_ZOOM
            }} 
        />
    )
}