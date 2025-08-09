export function createPoints(max, data, width, height) {
  // Calculate grid size for even cluster distribution
  const gridSize = Math.ceil(Math.sqrt(data.clusters.length));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  const points = [];

  data.clusters.forEach((cluster, i) => {
    const row = Math.floor(i / gridSize); // Row in grid
    const col = i % gridSize; // Column in grid

    // Random offset for organic, non-uniform placement
    const offsetX = (Math.random() - 0.5) * cellWidth * 0.5;
    const offsetY = (Math.random() - 0.5) * cellHeight * 0.5;

    let centerX = Math.round(cellWidth * (col + 0.5) + offsetX); // X position
    let centerY = Math.round(cellHeight * (row + 0.5) + offsetY); // Y position

    const radiusBase = 35 + (cluster.bookmarks.length / max) * 50; // Main blob size

    // Clamp center point to stay within bounds
    centerX = Math.max(radiusBase, Math.min(width - radiusBase, centerX));
    centerY = Math.max(radiusBase, Math.min(height - radiusBase, centerY));

    // Central core point for the cluster (used for label)
    points.push({
      x: centerX,
      y: centerY,
      value: cluster.bookmarks.length,
      radius: radiusBase,
      label: cluster.label,
      count: cluster.bookmarks.length,
    });

    // Add 3-5 extra fuzzy points around center for blob effect
    const fuzzCount = 5 + Math.floor(Math.random() * 3); // 5 to 7 points
    for (let j = 0; j < fuzzCount; j++) {
      const angle = Math.random() * 2 * Math.PI; // Random angle
      const distance = Math.random() * radiusBase * 0.5; // Random distance from center
      let fx = centerX + Math.cos(angle) * distance;
      let fy = centerY + Math.sin(angle) * distance;
      const fradius = 30 + Math.random() * 30;
      // Clamp fuzzy points as well
      fx = Math.max(fradius, Math.min(width - fradius, fx));
      fy = Math.max(fradius, Math.min(height - fradius, fy));
      points.push({
        x: fx, // Fuzzy X
        y: fy, // Fuzzy Y
        value: Math.round(
          cluster.bookmarks.length * (0.3 + Math.random() * 0.3)
        ), // 30–60% of core value for softer edges
        radius: fradius, // Variable radius for irregularity
      });
    }
  });

  return points;
}
