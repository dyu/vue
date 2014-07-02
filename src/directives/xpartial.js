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
            if (value == null || (value.hasOwnProperty('$initvar') && !value.$initvar)) return
            this.initial_update = true
        }
        
        if(this.cloned_partial) return
        
        var el       = this.el,
            compiler = this.compiler,
            partial  = this.cloned_partial = utils.toFragment(this.xpartial.main.call(this, value))
        
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

            var outlet = partial.querySelector('content'),
                // keep a ref to the el's content nodes
                nodes = outlet ? [].slice.call(el.childNodes) : null
            
            // just set innerHTML...
            el.innerHTML = ''
            el.appendChild(partial)
            
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