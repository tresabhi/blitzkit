export function Lighting() {
  return (
    <>
      <directionalLight
        position={[1, 1, -1]}
        intensity={3}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <directionalLight
        position={[-1, 1, 1]}
        intensity={2}
        castShadow
        color={'rgb(225, 225, 255)'}
      />
      <ambientLight intensity={0.25} />
    </>
  );
}
