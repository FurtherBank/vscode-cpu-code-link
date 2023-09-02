export function calculateNodeSize(fileSize: number): number {
  const baseSize = 1; // This is the base size of the node, you can adjust it to fit your needs
  const scale = 1.5; // This is the scale factor, you can adjust it to fit your needs

  // We add 1 to the fileSize before taking the logarithm to avoid Math.log(0) which is -Infinity.
  const result = baseSize + scale * Math.log2(fileSize / 1024 / 1.5 + 1);
  console.log("[info] calculateNodeSize", fileSize / 1024, result);

  return result;
}
