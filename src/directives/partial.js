var _ = require('../util')
var compile = require('../compile/compile')
var transclude = require('../compile/transclude')
var templateParser = require('../parse/template')

module.exports = {

  //isLiteral: true,

  bind: function () {
    var id = this.arg || this.expression
    var partial = this.vm.$options.partials[id]
    _.assertAsset(partial, 'partial', id)
    if (!partial) {
      return
    }
    if (this.arg) {
      // a dynamic partial
      if (typeof partial === 'string' || typeof partial.main !== 'function') {
        _.warn('The dynamic partial: ' + id + 
            ' must provide an object with a main function.  E.g. { main: function(param){ return "<div>hello</div>" } }')
      } else {
        this.dynamic_partial = partial
      }
      return
    }
    partial = templateParser.parse(partial, true)
    var el = this.el
    var vm = this.vm
    if (el.nodeType === 8) {
      // comment ref node means inline partial
      compile(partial, vm.$options)(vm, partial)
      _.replace(el, partial)
    } else {
      // just set innerHTML...
      el.innerHTML = ''
      el.appendChild(partial)
      compile(el, vm.$options, true)(vm, el)
    }
  },
  update: function(value) {
    if (!this.dynamic_partial || this.cloned_partial) return
    
    if (!this.initial_update) {
      if (!value || (value.hasOwnProperty('$initvar') && !value.$initvar)) return
      this.initial_update = true
    }
    
    var el      = this.el,
        vm      = this.vm,
        partial
    
    if (el.nodeType === 8) {
      // comment ref node means inline partial
      partial = templateParser.parse(this.dynamic_partial.main.call(this, value), true)
      compile(partial, vm.$options)(vm, partial)
      _.replace(el, partial)
    } else if (el.children && el.children.length) {
      // transclude
      partial = transclude(el, { template: this.dynamic_partial.main.call(this, value) })
      compile(el, vm.$options, true)(vm, el)
      //compile(partial, vm.$options)(vm, partial)
      // _.replace(el, partial)
    } else {
      // just set innerHTML...
      partial = templateParser.parse(this.dynamic_partial.main.call(this, value), true)
      el.innerHTML = ''
      el.appendChild(partial)
      compile(el, vm.$options, true)(vm, el)
    }
    
    this.cloned_partial = partial
  }
}