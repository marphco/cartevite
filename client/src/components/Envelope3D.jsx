import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function EnvelopeMeshes({ accent = "#f4c46b", reduceMotion = false }) {
  const bodyRef = useRef();
  const flapRef = useRef();
  const cardGroupRef = useRef();
  const shadowRef = useRef();
  const clockStart = useRef(null);

  const bodyColor = useMemo(() => new THREE.Color("#f8e9d5"), []);
  const flapColor = useMemo(() => new THREE.Color("#d8ac7a"), []);
  const cardColor = useMemo(() => new THREE.Color("#fffaf0"), []);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  const envelopeGeo = useMemo(() => new THREE.PlaneGeometry(2.2, 1.35, 2, 2), []);
  const flapGeo = useMemo(() => new THREE.PlaneGeometry(2.2, 1.2, 2, 2), []);
  const cardGeo = useMemo(() => new THREE.PlaneGeometry(1.7, 1.1, 2, 2), []);

  useFrame(({ clock }) => {
    if (!clockStart.current) clockStart.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - clockStart.current;

    const flapDuration = 1.4;
    const cardDelay = 0.5;
    const cardDuration = 1.2;

    const flapProgress = easeOutCubic(Math.min(1, elapsed / flapDuration));
    const cardProgress = easeOutCubic(
      Math.min(1, Math.max(0, (elapsed - cardDelay) / cardDuration))
    );

    if (flapRef.current) {
      flapRef.current.rotation.x = THREE.MathUtils.lerp(0, -2.1, flapProgress);
    }

    if (cardGroupRef.current) {
      const baseY = THREE.MathUtils.lerp(-0.25, 0.28, cardProgress);
      const floatY = reduceMotion ? 0 : Math.sin(elapsed * 0.8) * 0.03;
      cardGroupRef.current.position.y = baseY + floatY;
      cardGroupRef.current.position.z = THREE.MathUtils.lerp(-0.02, 0.12, cardProgress);
      const baseRotation = THREE.MathUtils.lerp(-0.1, 0.05, cardProgress);
      cardGroupRef.current.rotation.x = baseRotation + (reduceMotion ? 0 : Math.sin(elapsed * 0.6) * 0.03);
    }

    if (bodyRef.current && !reduceMotion) {
      bodyRef.current.position.y = Math.sin(elapsed * 0.5) * 0.02;
    }

    if (shadowRef.current) {
      shadowRef.current.material.opacity = 0.24 + cardProgress * 0.2;
      shadowRef.current.scale.setScalar(1 + cardProgress * 0.04);
    }
  });

  return (
    <group rotation={[-0.45, 0, 0]}>
      <mesh
        ref={shadowRef}
        position={[0, -0.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[3.4, 2]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      <mesh
        geometry={envelopeGeo}
        ref={bodyRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={bodyColor}
          roughness={0.7}
          metalness={0.05}
          clearcoat={0.25}
          clearcoatRoughness={0.6}
        />
      </mesh>

      <mesh
        geometry={flapGeo}
        ref={flapRef}
        position={[0, 0.7, -0.001]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={flapColor}
          roughness={0.55}
          metalness={0.15}
          clearcoat={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={cardGroupRef} position={[0, -0.25, -0.02]}>
        <mesh geometry={cardGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={cardColor}
            roughness={0.35}
            metalness={0.08}
            sheen={1}
            sheenRoughness={0.5}
          />
        </mesh>

        <mesh geometry={cardGeo} position={[0, 0, 0.003]}>
          <meshStandardMaterial
            color={new THREE.Color("#fffdf8")}
            emissive={accentColor.clone().multiplyScalar(0.12)}
          />
        </mesh>

        <mesh position={[0, 0, 0.004]}>
          <ringGeometry args={[0.6, 0.9, 64]} />
          <meshBasicMaterial color={accentColor.clone()} transparent opacity={0.6} />
        </mesh>
      </group>

      <mesh position={[0, -0.92, -0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 3]} />
        <meshStandardMaterial color="#0f0c08" roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
}

export default function Envelope3D({ accent = "#f4c46b" }) {
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div style={{ width: "100%", height: "360px" }}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ powerPreference: "high-performance", physicallyCorrectLights: true }}
      >
        <color attach="background" args={["#070607"]} />
        <Suspense fallback={null}>
          <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={220} />
          <ambientLight intensity={0.6} />
          <directionalLight intensity={1.2} position={[1.5, 2, 4]} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight intensity={0.4} position={[-1.5, -0.5, 1]} color={accent} />
          <Environment preset="warehouse" />
          <EnvelopeMeshes accent={accent} reduceMotion={reduceMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
