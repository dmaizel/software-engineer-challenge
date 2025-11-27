function generateDummyText() {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit']
  let result = ''
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * words.length)
    result += words[randomIndex] + ' '
  }
  const t = result.trim() + '.'

  console.info(t)
}

console.info('starting generating random texts...')

setInterval(generateDummyText, 1_000)
