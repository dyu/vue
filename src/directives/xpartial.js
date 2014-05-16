var utils = require('../utils')

/**
 *  Binding for partials that accept args and expressions
 */
module.exports = {
    
    bind: function () {
        var id = this.xpid || this.arg
        if (!id) return

        var el       = this.el,
            compiler = this.compiler,
            xpartial  = compiler.getOption('xpartials', id)

        if (!xpartial) {
            if (id === 'yield') {
                utils.warn('{{>yield}} syntax has been deprecated. Use <content> tag instead.')
            }
            return
        }
        this.xpartial = xpartial
    },
    update: function(value) {
        if(!this.initial_update) {
            if(value == null || (Array.isArray(value) && value.length && !value[0])) return
            this.initial_update = true
        }
        
        if(this.cloned_partial) return
        
        var el       = this.el,
            compiler = this.compiler,
            partial  = this.cloned_partial = this.xpartial.call(this, value)
        
        // comment ref node means inline partial
        if (el.nodeType === 8) {

            // keep a ref for the partial's content nodes
            var nodes = [].slice.call(partial.childNodes),
                parent = el.parentNode
            parent.insertBefore(partial, el)
            parent.removeChild(el)
            // compile partial after appending, because its children's parentNode
            // will change from the fragment to the correct parentNode.
            // This could affect directives that need access to its element's parentNode.
            nodes.forEach(compiler.compile, compiler)

        } else {

            // just set innerHTML...
            el.innerHTML = ''
            el.appendChild(partial)

        }
    }
}