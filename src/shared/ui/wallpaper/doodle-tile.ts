export const DOODLE_TILE_SIZE = 256

const sparkle = (x: number, y: number, scale: number): string =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M 0 -8 C 1.4 -2.7 2.7 -1.4 8 0 C 2.7 1.4 1.4 2.7 0 8 C -1.4 2.7 -2.7 1.4 -8 0 C -2.7 -1.4 -1.4 -2.7 0 -8 Z"/></g>`

const dot = (x: number, y: number, radius: number): string =>
  `<circle cx="${x}" cy="${y}" r="${radius}"/>`

const doodles: string = [
  `<g transform="translate(40 46)">
    <path d="M 0 -17 C 8.5 -9 8.5 9 0 17 C -8.5 9 -8.5 -9 0 -17 Z"/>
    <circle cx="0" cy="-5" r="3.4"/>
    <path d="M -7.5 8 Q -14 14 -11.5 20 L -4.5 14.5"/>
    <path d="M 7.5 8 Q 14 14 11.5 20 L 4.5 14.5"/>
    <path d="M -2.5 24 L 0 21 L 2.5 24"/>
  </g>`,
  `<g transform="translate(56 176) rotate(-12)">
    <rect x="-8" y="-5.5" width="16" height="11" rx="3"/>
    <path d="M -8 0 L -20 0 L -30 -4 L -30 4 L -20 0 M 8 0 L 20 0 L 30 -4 L 30 4 L 20 0"/>
    <path d="M 0 -5.5 L 0 -13 A 6 6 0 0 1 6 -7"/>
    ${dot(2, -14, 1.4)}
  </g>`,
  `<g transform="translate(105 122) scale(1.15)">
    <path d="M 10 0 A 11 11 0 1 0 12.8 10.4 A 8.8 8.8 0 1 1 10 0 Z"/>
  </g>`,
  `<g transform="translate(176 58)">
    <circle cx="0" cy="0" r="13"/>
    <ellipse cx="0" cy="0" rx="27" ry="8.5" transform="rotate(-18)"/>
  </g>`,
  `<g transform="translate(202 110) rotate(8)">
    <path d="M 0 -12 C 7 -12 10 -5 8.5 3 C 7.5 9 4 12 0 12 C -4 12 -7.5 9 -8.5 3 C -10 -5 -7 -12 0 -12 Z"/>
    <ellipse cx="-3.6" cy="0.5" rx="2.4" ry="3.4"/>
    <ellipse cx="3.6" cy="0.5" rx="2.4" ry="3.4"/>
    <path d="M -4 -11.5 L -7 -17.5 M 4 -11.5 L 7 -17.5"/>
    ${dot(-7, -18, 1.2)}
    ${dot(7, -18, 1.2)}
  </g>`,
  `<g transform="translate(198 176) rotate(-6)">
    <path d="M -6 3 A 7 7 0 0 1 6 3"/>
    <ellipse cx="0" cy="4" rx="15" ry="4.5"/>
    <path d="M -9 7.5 L -11 13 M 0 8.5 L 0 14 M 9 7.5 L 11 13"/>
  </g>`,
  `<g transform="translate(118 200) rotate(-14)">
    <path d="M 0 0 L 30 -7 L 44 12"/>
    ${dot(0, 0, 2)}
    ${dot(30, -7, 2)}
    ${dot(44, 12, 2)}
  </g>`,
  sparkle(112, 40, 1.25),
  sparkle(26, 112, 0.7),
  sparkle(148, 148, 0.55),
  sparkle(222, 34, 0.5),
  `<g transform="translate(160 16)">
    <path d="M 0 0 L 34 10"/>
    ${dot(34, 10, 1.8)}
  </g>`,
].join('')

export const buildDoodleTileMarkup = (color: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${DOODLE_TILE_SIZE}" height="${DOODLE_TILE_SIZE}" viewBox="0 0 ${DOODLE_TILE_SIZE} ${DOODLE_TILE_SIZE}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${doodles}</svg>`

const tileCache = new Map<string, string>()

export const doodleTile = (color: string): string => {
  const cached = tileCache.get(color)
  if (cached !== undefined) {
    return cached
  }
  const tile = `url("data:image/svg+xml,${encodeURIComponent(buildDoodleTileMarkup(color))}")`
  tileCache.set(color, tile)
  return tile
}
