/**
 * Контрольные точки кривых Flutter (`Curves.easeOutCubic` = Cubic(0.215,
 * 0.61, 0.355, 1.0)). Превью и CSS-токены анимируют той же кривой, что и
 * код; кривая без записи здесь останавливает сборку, а не тихо подменяется
 * на `ease`.
 */
export const CURVE_BEZIER = {
  easeOutCubic: '.215,.61,.355,1',
  easeInCubic: '.55,.055,.675,.19',
};

export function cssCurve(name) {
  const bezier = CURVE_BEZIER[name];
  if (!bezier) throw new Error(`нет cubic-bezier для кривой "${name}" — добавьте её в tools/curves.js`);
  return `cubic-bezier(${bezier})`;
}
