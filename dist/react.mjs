/*! @s4e/mitosis-loader — loader "mitose" (Web Component, zero dependências) */
import { createElement } from 'react';
import './mitosis-loader.mjs';

/** <S4ELoader size={48} color="#7C154D" speed={1} /> */
export function MitosisLoader({ size = 64, color, speed, label, paused, className, style, ...rest }) {
  return createElement('s4e-loader', {
    size: String(size),
    color,
    speed: speed != null ? String(speed) : undefined,
    label,
    paused: paused ? '' : undefined,
    className,
    style,
    ...rest,
  });
}
export { MitosisLoader as S4ELoader };
export default MitosisLoader;
