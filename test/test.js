var strokkit = require('../index')

var test = strokkit(document.querySelectorAll('[data-strokkit]'))
test.init()
test.start()