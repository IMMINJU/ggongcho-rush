export class PixelRenderer {
  static scale = 2

  static drawSprite(ctx: CanvasRenderingContext2D, x: number, y: number, sprite: string[], palette: Record<string, string>): void {
    const s = this.scale
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const char = sprite[row][col]
        if (char !== ' ' && char !== '.') {
          ctx.fillStyle = palette[char] || '#ff00ff'
          ctx.fillRect(x + col * s, y + row * s, s, s)
        }
      }
    }
  }
}

export const SPRITES = {
  player: {
    idle: [
      '  ####  ',
      ' #1111# ',
      ' #1111# ',
      '  #11#  ',
      ' ##22## ',
      '#222222#',
      '#222222#',
      ' #2222# ',
      ' #3##3# ',
      ' #3##3# ',
      ' ##  ## ',
    ],
    walk1: [
      '  ####  ',
      ' #1111# ',
      ' #1111# ',
      '  #11#  ',
      ' ##22## ',
      '#222222#',
      '#222222#',
      ' #2222# ',
      ' #3# #3#',
      ' #3#  ##',
      ' ##     ',
    ],
    walk2: [
      '  ####  ',
      ' #1111# ',
      ' #1111# ',
      '  #11#  ',
      ' ##22## ',
      '#222222#',
      '#222222#',
      ' #2222# ',
      '#3# #3# ',
      '##  #3# ',
      '     ## ',
    ],
    smoking: [
      '  ####  ',
      ' #1111# ',
      ' #1111#4',
      '  #11#45',
      ' ##22## ',
      '#222222#',
      '#222222#',
      ' #2222# ',
      ' #3##3# ',
      ' #3##3# ',
      ' ##  ## ',
    ]
  },
  smoker: {
    worker: [
      '  ####  ',
      ' #1111# ',
      ' #1111# ',
      '  #11#  ',
      ' ##66## ',
      '#666666#',
      '#666666#',
      ' #6666# ',
      ' #7##7# ',
      ' #7##7# ',
      ' ##  ## ',
    ],
    drunk: [
      '  ####  ',
      ' #1111# ',
      ' #1*11# ',
      '  #11#  ',
      ' ##88## ',
      '#888888#',
      '#888888#',
      ' #8888# ',
      ' #7##7# ',
      ' #7##7# ',
      ' ##  ## ',
    ],
    student: [
      '  ####  ',
      ' #9999# ',
      ' #1111# ',
      '  #11#  ',
      ' ##AA## ',
      '#AAAAAA#',
      '#AAAAAA#',
      ' #AAAA# ',
      ' #7##7# ',
      ' #7##7# ',
      ' ##  ## ',
    ],
    vaper: [
      '  ####  ',
      ' #1111# ',
      ' #1111# ',
      '  #11#  ',
      ' ##BB## ',
      '#BBBBBB#',
      '#BBBBBB#',
      ' #BBBB# ',
      ' #7##7# ',
      ' #7##7# ',
      ' ##  ## ',
    ]
  },
  police: [
    '  CCCC  ',
    ' #CCCC# ',
    ' #1111# ',
    '  #11#  ',
    ' ##DD## ',
    '#DEDDDD#',
    '#DDDDDD#',
    ' #DDDD# ',
    ' #D##D# ',
    ' #D##D# ',
    ' ##  ## ',
  ],
  rival: [
    '  ####  ',
    ' #FFFF# ',
    ' #1111# ',
    '  #11#  ',
    ' ##GG## ',
    '#GGGGGG#',
    '#GGGGGG#',
    ' #GGGG# ',
    ' #G##G# ',
    ' #G##G# ',
    ' ##  ## ',
  ],
  butt: {
    short: ['4HH5'],
    normal: ['4HHHH5'],
    long: ['4HHHHHH5']
  },
  coin: [
    ' III ',
    'IJJJI',
    'IJJJI',
    'IJJJI',
    ' III ',
  ],
  smoke: [
    ' K ',
    'K K',
    ' K ',
  ]
}

export const PALETTES = {
  player: {
    '#': '#000000',
    '1': '#d4a574', // skin
    '2': '#5c4033', // coat
    '3': '#2a2a2a', // pants
    '4': '#ffffff', // cigarette
    '5': '#ff6b35', // ember
  },
  smoker: {
    '#': '#000000',
    '1': '#d4a574', // skin
    '*': '#ff6666', // drunk blush
    '6': '#2a2a4a', // worker suit
    '7': '#1a1a1a', // pants
    '8': '#5a3a3a', // drunk coat
    '9': '#1a1a1a', // student hair
    'A': '#3a4a5a', // student uniform
    'B': '#4a5a4a', // vaper hoodie
  },
  police: {
    '#': '#000000',
    '1': '#d4a574',
    'C': '#1a2a4a', // cap
    'D': '#1a3a6a', // uniform
    'E': '#ffd700', // badge
  },
  rival: {
    '#': '#000000',
    '1': '#c4a484',
    'F': '#5a5a5a', // dirty hair
    'G': '#4a4a3a', // dirty coat
  },
  butt: {
    '4': '#ff4500', // ember
    '5': '#8b4513', // filter
    'H': '#f5f5dc', // paper
  },
  coin: {
    'I': '#daa520',
    'J': '#ffd700',
  },
  smoke: {
    'K': 'rgba(200,200,200,0.5)',
  }
}
