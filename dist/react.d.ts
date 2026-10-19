import type { CSSProperties, HTMLAttributes } from 'react';
export interface MitosisLoaderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  size?: number | string;
  color?: string;
  speed?: number;
  label?: string;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
}
export declare function MitosisLoader(props: MitosisLoaderProps): JSX.Element;
export { MitosisLoader as S4ELoader };
export default MitosisLoader;
