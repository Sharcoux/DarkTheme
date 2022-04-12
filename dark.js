let treatedNodes = []
function onload() {
  const disabled = JSON.parse(localStorage.getItem('disabled') || 'false')
  if (disabled) return
  // We need the reverse to treat children first
  const nodes = Array.from(document.getElementsByTagName("*")).reverse()
  nodes.filter(node => !treatedNodes.includes(node)).filter(node => node.nodeType === node.ELEMENT_NODE).forEach(node => {
    const style = window.getComputedStyle(node)
    // const parentStyle = node.parentElement && window.getComputedStyle(node.parentElement)
    const parentStyle = undefined
    handleColor(node, style, parentStyle)
    handleBorderColor(node, style, parentStyle)
    handleBackground(node, style, parentStyle)
    handleImages(node, style, parentStyle)
  })
  treatedNodes = nodes
}

function init() {
  const disabled = JSON.parse(localStorage.getItem('disabled') || 'false')
  browser.runtime.sendMessage({ disabled })
  onload()
  const body = document.getElementsByTagName('body')[0]
  body.style.setProperty('background-color', '#202020', 'important')
  body.style.setProperty('color', '#F0F0F0', 'important')
  const bodyObserver = new MutationObserver(onload);
  bodyObserver.observe(body, { childList: true, subtree: true })
}


window.toggle = () => {
  const disabled = !JSON.parse(localStorage.getItem('disabled') || 'false')
  localStorage.setItem('disabled', disabled)
  if (disabled) window.location.reload()
  else onload()
}

onload()
if (document.readyState === "complete") {
  init()
} else {
  window.addEventListener
    ? window.addEventListener("load", init, false)
    : window.attachEvent && window.attachEvent("onload", init);
}

function handleImages(node, style) {
  if (node.tagName.toLowerCase() === 'img' || style.backgroundImage !== 'none') {
    node.style.filter = 'brightness(80%)'
  }
}

function handleColor(node, style, parentStyle) {
  // if (parentStyle && parentStyle.color === style.color) return
  const hsl = rgbaToHSL(style.color)
  if (!hsl) return
  const [h, s, l, a] = hsl
  if (a === 0) return
  const newColor = hslToHex([h, s, Math.min(85, l < 50 ? (100 - l) : l), a])
  node.style.setProperty('color', newColor, 'important')
}

function handleBorderColor(node, style, parentStyle) {
  // if (parentStyle && parentStyle.borderColor === style.borderColor) return
  const hsl = rgbaToHSL(style.borderColor)
  if (!hsl) return
  const [h, s, l, a] = hsl
  if (a === 0) return
  const newColor = hslToHex([h, s, Math.min(85, l < 50 ? (100 - l) : l), a])
  node.style.setProperty('border-color', newColor, 'important')
}

function handleBackground(node, style, parentStyle) {
  // if (parentStyle && parentStyle.backgroundColor === style.backgroundColor) return
  const hsl = rgbaToHSL(style.backgroundColor)
  if (!hsl) return
  const [h, s, l, a] = hsl
  if (a === 0) return
  const newColor = hslToHex([h, s, Math.max(10, l > 50 ? 100 - l : l), a])
  node.style.setProperty('background-color', newColor, 'important')
}

function rgbaToHSL(rgba) {
  if (!rgba) return
  try {
    const rgb = rgba
      .toLowerCase()
      .match(/^rgba?\((\d+),\s+(\d+),\s+(\d+),?\s?(\d*.?\d+)?\)/i)
      .slice(1, 5)
    const [r, g, b, a] = rgb.map(v => parseInt(v || 1, 10) / 255)
    const [min, , max] = [r, g, b].sort()
    const l = Math.round((100 * (max + min)) / 2)

    if (max === min) {
      // achromatic
      return [0, 0, l, a]
    } else {
      const d = max - min
      const s = Math.round((100 * d) / (l > 50 ? 2 - max - min : max + min))
      let h = 0
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h = Math.round(h * 60)
      return [h, s, l, a]
    }
  } catch (err) {
    console.error(rgba, err)
    return [0, 0, 0, 0]
  }
}

function hslToHex([h, s, l, a]) {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  const toRGBA = (x) => Math.round(x * 255).toString(10)
  return `rgba(${toRGBA(r)},${toRGBA(g)},${toRGBA(b)},${toRGBA(a)})`
}
