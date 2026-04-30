"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Loader() {
  return (
    <Html center>
      <div className="earth-loader">
        <span className="earth-loader-ring" />
      </div>
    </Html>
  );
}

function CameraSetup() {
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5.4);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    gl.setClearColor(0x000000, 0);
  }, [camera, gl]);

  return null;
}

function EarthScene({
  url,
  enableHoverRotation = true,
  enableMouseParallax = true,
  enableManualRotation = true,
  onLoaded
}) {
  const { scene } = useGLTF(url);
  const { gl } = useThree();
  const rootRef = useRef(null);
  const baseRotation = useRef({ x: 0.18, y: 0.82 });
  const targetRotation = useRef({ x: 0.18, y: 0.82 });
  const dragState = useRef({
    active: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
  });

  const content = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = false;
      child.receiveShadow = false;

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone());
      } else if (child.material) {
        child.material = child.material.clone();
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        material.side = THREE.FrontSide;
        material.transparent = true;
        material.opacity = 1;
        material.toneMapped = true;

        if ("emissiveIntensity" in material) {
          material.emissiveIntensity = material.name === "Earth" ? 0.04 : 0.02;
        }

        if ("color" in material && material.color) {
          material.color = material.color.clone().multiplyScalar(material.name === "Earth" ? 1.24 : 1.06);
        }

        if ("roughness" in material && material.name === "Earth") {
          material.roughness = 0.92;
        }

        if ("metalness" in material && material.name === "Earth") {
          material.metalness = 0;
        }
      });
    });

    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const box = new THREE.Box3().setFromObject(content);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.55 / maxAxis;

    rootRef.current.clear();
    rootRef.current.add(content);
    content.position.set(-center.x, -center.y, -center.z);
    rootRef.current.scale.setScalar(scale);
    rootRef.current.position.set(0, -0.06, 0);
    rootRef.current.rotation.set(baseRotation.current.x, baseRotation.current.y, 0);

    onLoaded?.();
  }, [content, onLoaded]);

  useEffect(() => {
    if (!enableManualRotation) return undefined;

    const canvas = gl.domElement;

    const handlePointerDown = (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      dragState.current.active = true;
      dragState.current.startX = event.clientX;
      dragState.current.startY = event.clientY;
      dragState.current.x = targetRotation.current.y || baseRotation.current.y;
      dragState.current.y = targetRotation.current.x || baseRotation.current.x;
      canvas.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (!dragState.current.active) return;

      const dx = event.clientX - dragState.current.startX;
      const dy = event.clientY - dragState.current.startY;

      targetRotation.current.y = dragState.current.x + dx * 0.0045;
      targetRotation.current.x = THREE.MathUtils.clamp(
        dragState.current.y + dy * 0.0038,
        -0.45,
        0.45,
      );
    };

    const handlePointerUp = (event) => {
      dragState.current.active = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [enableManualRotation, gl]);

  useFrame((state) => {
    if (!rootRef.current) return;

    if (!dragState.current.active) {
      const mouseY = enableHoverRotation
        ? state.mouse.x * 0.18 + baseRotation.current.y
        : baseRotation.current.y;
      const mouseX = enableHoverRotation
        ? state.mouse.y * 0.12 + baseRotation.current.x
        : baseRotation.current.x;
      targetRotation.current.y = THREE.MathUtils.lerp(targetRotation.current.y, mouseY, 0.06);
      targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, mouseX, 0.06);
    }

    const offsetX = enableMouseParallax ? state.mouse.x * 0.12 : 0;
    const offsetY = enableMouseParallax ? state.mouse.y * 0.08 - 0.06 : -0.06;

    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetRotation.current.y, 0.07);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetRotation.current.x, 0.07);
    rootRef.current.position.x = THREE.MathUtils.lerp(rootRef.current.position.x, offsetX, 0.05);
    rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, offsetY, 0.05);
  });

  return <group ref={rootRef} />;
}

export default function ModelViewer({
  url = "/models/earth.glb",
  width = "100%",
  height = "100%",
  ambientIntensity = 1.15,
  keyLightIntensity = 1.35,
  fillLightIntensity = 0.65,
  rimLightIntensity = 0.45,
  autoRotate = false,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  showScreenshotButton = false,
  onModelLoaded
}) {
  useEffect(() => {
    useGLTF.preload(url);
  }, [url]);

  return (
    <div className="earth-viewer-stage" style={{ width, height }}>
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        camera={{ position: [0, 0, 5.4], fov: 38, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.42;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <CameraSetup />
        <ambientLight intensity={ambientIntensity} />
        <hemisphereLight args={["#e3f4ff", "#0a1111", 0.95]} />
        <directionalLight position={[3.2, 2.8, 3.4]} intensity={keyLightIntensity} color="#ffffff" />
        <directionalLight position={[-2.4, 1.2, 2]} intensity={fillLightIntensity} color="#dff1ff" />
        <directionalLight position={[0.6, -1.8, -2.2]} intensity={rimLightIntensity} color="#9bcc56" />

        <Suspense fallback={<Loader />}>
          <EarthScene
            url={url}
            enableHoverRotation={enableHoverRotation}
            enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation}
            onLoaded={onModelLoaded}
          />
        </Suspense>
      </Canvas>

      {showScreenshotButton ? null : null}
    </div>
  );
}
