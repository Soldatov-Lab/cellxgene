import { glPointFlags, glPointSize } from "../../util/glHelpers";

export default function drawPointsRegl(regl) {
  return regl({
    vert: `
    precision mediump float;

    attribute vec2 position;
    attribute vec3 color;
    attribute float flag;
    attribute float zOrder;

    uniform mat3 projection;
    uniform float nPoints;
    uniform float minViewportDimension;

    varying lowp vec4 fragColor;

    const float zBottom = 0.99;
    const float zMiddle = 0.;
    const float zTop = -1.;
    // zGap: minimum distance between a z=0 continuous point and true background,
    // ensures values at the low end are still rendered in front of background.
    const float zGap = 0.01;

    // import getFlags()
    ${glPointFlags}

    // get pointSize()
    ${glPointSize}

    void main() {
      bool isBackground, isSelected, isHighlight;
      getFlags(flag, isBackground, isSelected, isHighlight);

      gl_PointSize = pointSize(nPoints, minViewportDimension, isSelected, isHighlight);

      float z;
      if (zOrder >= 0.0) {
        // Continuous mode: interpolate z from zBottom (low value) to zMiddle (high value).
        if (isBackground) {
          z = zBottom;
        } else {
          z = mix(zBottom - zGap, zMiddle, zOrder);
          if (isHighlight) z = zTop;
        }
      } else {
        // Categorical / default mode: use existing flag-based z
        z = isBackground ? zBottom : (isHighlight ? zTop : zMiddle);
      }
      vec3 xy = projection * vec3(position, 1.);
      gl_Position = vec4(xy.xy, z, 1.);

      float alpha = isBackground ? 0.9 : 1.0;
      fragColor = vec4(color, alpha);
    }`,

    frag: `
    precision mediump float;
    varying lowp vec4 fragColor;
    void main() {
      if (length(gl_PointCoord.xy - 0.5) > 0.5) {
        discard;
      }
      gl_FragColor = fragColor;
    }`,

    attributes: {
      position: regl.prop("position"),
      color: regl.prop("color"),
      flag: regl.prop("flag"),
      zOrder: regl.prop("zOrder"),
    },

    uniforms: {
      projection: regl.prop("projection"),
      nPoints: regl.prop("nPoints"),
      minViewportDimension: regl.prop("minViewportDimension"),
    },

    count: regl.prop("count"),

    primitive: "points",

    depth: {
      enable: true,
      func: "<=",
    },

    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: 0,
        dstAlpha: "zero",
      },
    },
  });
}
