export interface MitosisLoaderAttributes {
  /** Tamanho em px (número) ou qualquer unidade CSS. Padrão: 64 */
  size?: number | string;
  /** Cor de preenchimento. Padrão: #7C154D (ou var(--s4e-color)) */
  color?: string;
  /** Multiplicador de velocidade. 1 = loop de 6s. */
  speed?: number | string;
  /** Texto acessível (aria-label). Padrão: "Carregando" */
  label?: string;
  /** Presente = animação pausada */
  paused?: boolean | '';
}
export declare class MitosisLoader extends HTMLElement {
  static readonly observedAttributes: string[];
}
export declare function defineMitosisLoader(tag?: string): void;
export declare const MITOSIS_COLOR: string;
export default MitosisLoader;

declare global {
  interface HTMLElementTagNameMap { 's4e-loader': MitosisLoader; }
}
