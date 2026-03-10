/*
Utility code for WebGL shaders
*/

/*
PointFlags:
  Point flags are used in graph & scatter plots.

  We want a bitmask-like flag structure, but due to webgl limitations
  must emulate it with floats.

  Supported flags are:

    selected: the point is currently selected
    highlight: the point is currently highlighted
    background: the point is background information
*/

// for JS
export const flagSelected = 1;
export const flagBackground = 2;
export const flagHighlight = 4;

// for GLSL
export const glPointFlags = `

  const float flagSelected = 1.;
  const float flagBackground = 2.;
  const float flagHighlight = 4.;

  bool isLowBitSet(float f) {
    f = mod(f, 2.);
    return (f > 0.9 && f <= 1.1);
  }

  float shiftRightOne(float f) {
    return floor(f / 2.);
  }

  void getFlags(in float flag,
                out bool isBackground,
                out bool isSelected,
                out bool isHighlight) {
    isSelected = isLowBitSet(flag);
    flag = shiftRightOne(flag);
    isBackground = isLowBitSet(flag);
    flag = shiftRightOne(flag);
    isHighlight = isLowBitSet(flag);
  }

`;

/*
Point Size:
  Calculate point size for scatter plot based upon pseudo density.

  Current approach: linear scaling of point size, clamped to [1,10],
  between two points that are based on empirical testing.

    - 1M points on a 500x500 canvas: 1M/(500*500) -> 0.5
    - 1000 points on a 1440x1440 canvas:  1000/(1440*1440) -> 5

  The domain is pseudo density (numPoints / minViewportDimension^2)
  The range is web gl point size.
*/

// configuration
const domain = [1000000 / (500 * 500), 1000 / (1440 * 1440)];
const range = [0.5, 5];

// derived from configuration
const scale = (range[1] - range[0]) / (domain[1] - domain[0]);
const offset = scale * -domain[0] + range[0];

export const glPointSize = `
  float pointSize(float nPoints, float minViewportDimension, bool isSelected, bool isHighlight) {
    float density = nPoints / (minViewportDimension * minViewportDimension);
    float pointSize = (${scale.toFixed(4)}*density) + ${offset.toFixed(4)};
    pointSize = clamp(pointSize, 
      ${range[0].toFixed(4)}, 
      ${range[1].toFixed(4)});

    if (isHighlight) return 2. * pointSize;
    if (isSelected) return pointSize;
    return pointSize / 3.;
  }
`;

/*
Continuous color mode helpers
*/
const continuousColorModes = new Set([
  "color by continuous metadata",
  "color by expression",
  "color by geneset mean expression",
]);

const metadataColorModes = new Set([
  "color by categorical metadata",
  "color by continuous metadata",
]);

export function isContinuousColorMode(colorMode) {
  return continuousColorModes.has(colorMode);
}

/** Returns true for obs-metadata color modes where colorDf is indexed by column name (col()). */
export function isMetadataColorMode(colorMode) {
  return metadataColorModes.has(colorMode);
}

export function computeZOrderForContinuous(
  colorByData,
  nObs,
  zOrderMode = "max"
) {
  /*
  Normalize continuous color-by data to [0, 1] for z-depth ordering.
  Returns a Float32Array of length nObs:
    - values in [0,1] for finite data (0 = lowest order, 1 = highest order)
    - -1.0 sentinel for non-finite values or when not in continuous mode
  When colorByData is null/undefined, returns all -1 (no z-ordering).
  zOrderMode determines the rendering order policy.
  */
  const zOrder = new Float32Array(nObs);
  if (!colorByData) {
    zOrder.fill(-1.0);
    return zOrder;
  }

  // find min/max of finite values
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < nObs; i += 1) {
    const val = colorByData[i];
    if (Number.isFinite(val)) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  const valueRange = max - min;
  if (valueRange === 0 || !Number.isFinite(valueRange)) {
    // all same value or no finite values — no z-ordering
    zOrder.fill(-1.0);
    return zOrder;
  }

  for (let i = 0; i < nObs; i += 1) {
    const val = colorByData[i];
    if (Number.isFinite(val)) {
      const normVal = (val - min) / valueRange;

      switch (zOrderMode) {
        case "max":
          zOrder[i] = normVal;
          break;
        case "min":
          zOrder[i] = 1.0 - normVal;
          break;
        case "mid":
          // Mid is [0, 1], with 0.5 mapping to 0, and 0/1 mapping to 1.
          zOrder[i] = Math.abs(normVal - 0.5) * 2;
          break;
        case "mid_rev":
          // Mid_rev is [0, 1], with 0.5 mapping to 1, and 0/1 mapping to 0.
          zOrder[i] = 1.0 - Math.abs(normVal - 0.5) * 2;
          break;
        case "random":
          // Deterministic pseudo-random based on the index.
          zOrder[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
          if (zOrder[i] < 0) zOrder[i] += 1;
          break;
        default:
          zOrder[i] = normVal;
      }
    } else {
      zOrder[i] = -1.0;
    }
  }
  return zOrder;
}
