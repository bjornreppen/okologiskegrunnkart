function getPolygonDepth(polygon) {
  if (!polygon) return 0;
  if (!Array.isArray(polygon) || polygon.length === 0) return 0;
  const depth1 = polygon[0];
  if (!Array.isArray(depth1) || depth1.length === 0) return 1;
  const depth2 = depth1[0];
  if (!Array.isArray(depth2) || depth2.length === 0) return 2;
  const depth3 = depth2[0];
  if (!Array.isArray(depth3) || depth3.length === 0) return 3;
  return 4;
}

export default getPolygonDepth;