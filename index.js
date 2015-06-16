var raf = require('raf-loop')
var extend = require('xtend')
var sanitize = require('sanitize-elements')
var createNode = require('svg-node')
var elementSize = require('element-size')

module.exports = function($elements, opts) {
  var options = extend(true, {
    array: '4, 4',
    color: '#000',
    speed : 0.5,
    width: 1
  }, opts)

  var blocks = [ ]

  var init = function () {
    if ($elements = sanitize($elements, true)) {
      kickoff()
    } else {
      console.warn('no elements here!')
    }
  }

  var kickoff = function () {
    for (var i = 0; i < $elements.length; i++) {
      format($elements[i])
    }
  }

  var format = function ($element) {
    var block = { }
    var svg = createNode('svg')
    var rect = createNode('rect')
    var offset = 0
    var backwards = false
    var size = elementSize($element)
    var position = $element.currentStyle ? $element.currentStyle.position : getComputedStyle($element, null).position
    
    var block = {
      size: size,
      svg: svg,
      rect: rect
    }

    var loop = raf(function() {
      if (backwards) {
        offset = offset + (1 * options.speed)
        rect.setAttribute('stroke-dashoffset', offset)
      } else {
        offset = offset - (1 * options.speed)
        rect.setAttribute('stroke-dashoffset', offset)
      }
    })

    // Prevent setting it up again
    if ($element.hasAttribute('data-strokkit-formatted')) {
      return false
    }

    // Set the styles for the container
    if (position === 'static' || position === '') {
      $element.style.position = 'relative'
    }

    // Setup the block
    resizeBlock(block)

    // Rectangle
    rect.setAttribute('x', options.width / 2)
    rect.setAttribute('y', options.width / 2)
    rect.setAttribute('fill-opacity', 0)
    rect.setAttribute('stroke', options.color)
    rect.setAttribute('stroke-width', options.width)
    rect.setAttribute('stroke-dasharray', options.array)
    rect.setAttribute('vector-effect', 'non-scaling-stroke')
     
    // SVG
    svg.appendChild(rect)

    // SVG positioning
    svg.style['position'] = 'absolute'
    svg.style['top'] = 0
    svg.style['left'] = 0
    svg.style['pointer-events'] = 'none'

    $element.addEventListener('mouseenter', function() {
      backwards = Math.random() < 0.5
      loop.start()
    }, false)

    $element.addEventListener('mouseleave', function() {
      loop.stop()
    }, false)

    blocks.push(block)
    $element.setAttribute('data-strokkit-formatted', '')
    $element.appendChild(svg)
  }

  var resizeBlock = function (block) {
    block.rect.setAttribute('width', block.size[0] - options.width)
    block.rect.setAttribute('height', block.size[1] - options.width)
    block.svg.setAttribute('width', block.size[0])
    block.svg.setAttribute('height', block.size[1])
  }

  var resize = function () {
    for (var i = 0; i < blocks.length; i++) {
      resizeBlock(blocks[i])
    }
  }

  var start = function () {
    resize()
    window.addEventListener('resize', resize, false)
  }

  var stop = function () {
    window.removeEventListener('resize', resize, false)
  }

  return {
    init: init,
    start: start,
    stop: stop
  }
}