var _ = require('../util')
var compile = require('../compile/compile')
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
      if (typeof partial === 'string') {
        _.warn('The dynamic partial: ' + id + ' must provide an object.  E.g. { main: function(param){ return "template" } }')
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
    if (!this.initial_update) {
        if (!value || (value.hasOwnProperty('$initvar') && !value.$initvar)) return
        this.initial_update = true
    }
    
    if (this.cloned_partial) return
    
    var el      = this.el,
        vm      = this.vm,
        partial = this.cloned_partial = templateParser.parse(this.dynamic_partial.main.call(this, value), true)
    
    if (el.nodeType === 8) {
      // comment ref node means inline partial
      compile(partial, vm.$options)(vm, partial)
      _.replace(el, partial)
    } else {
      var outlet = partial.querySelector('content'),
          // keep a ref to the el's content nodes
          nodes = outlet ? [].slice.call(el.childNodes) : null
    
      // just set innerHTML...
      el.innerHTML = ''
      el.appendChild(partial)
      compile(el, vm.$options, true)(vm, el)
    
      if (nodes && nodes.length) {
        // insert original content into the partial's <content/> tag
        var parent = outlet.parentNode,
            i = 0, len = nodes.length
        
        while (i < len) {
          parent.insertBefore(nodes[i++], outlet)
        }
        
        parent.removeChild(outlet)
      }
    }
  }
}