var raf = require('raf-loop')
var extend = require('xtend')
var sanitize = require('sanitize-elements')
var createNode = require('svg-node')
var elementSize = require('element-size')

module.exports = function($elements, opts) {
  var options = extend(true, {
    array: '10, 10',
    color: '#000',
    sourceAttr: 'data-strokkit',
    width: 2
  }, opts)

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
    var svg = createNode('svg')
    var rect = createNode('rect')
    var offset = 0
    var backwards = false
    var size = elementSize($element)
    var position = $element.currentStyle ? $element.currentStyle.position : getComputedStyle($element, null).position
    
    var loop = raf(function() {
      if (backwards) {
        rect.setAttribute('stroke-dashoffset', offset--)
      } else {
        rect.setAttribute('stroke-dashoffset', offset++)
      }
    })

    // Set the styles for the container
    if (position === 'static' || position === '') {
      $element.style.position = 'relative'
    }

    // Rectangle
    rect.setAttribute('x', options.width / 2)
    rect.setAttribute('y', options.width / 2)
    rect.setAttribute('width', size[0] - options.width)
    rect.setAttribute('height', size[1] - options.width)
    rect.setAttribute('fill-opacity', 0)
    rect.setAttribute('stroke', options.color)
    rect.setAttribute('stroke-width', options.width)
    rect.setAttribute('stroke-dasharray', options.array)
     
    // SVG
    svg.setAttribute('width', size[0])
    svg.setAttribute('height', size[1])
    svg.appendChild(rect)

    // SVG positioning
    svg.style.position = 'absolute'
    svg.style.top = 0
    svg.style.left = 0

    $element.addEventListener('mouseenter', function() {
      backwards = Math.random() < 0.5
      loop.start()
    }, false)

    $element.addEventListener('mouseleave', function() {
      loop.stop()
    }, false)

    $element.appendChild(svg)
  }

  var resize = function () {
    for (var i = 0; i < $elements.length; i++) {
      // format($elements[i])
    }
  }

  var on = function () {
    resize()
    window.addEventListener('resize', resize, false)
  }

  var off = function () {
    window.removeEventListener('resize', resize, false)
  }

  return {
    init: init,
    on: on,
    off: off
  }
}