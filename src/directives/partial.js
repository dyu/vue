var utils = require('../utils')

/**
 *  Binding for partials
 */
module.exports = {

    isLiteral: true,

    bind: function () {

        var id = this.expression
        if (!id) return

        var el       = this.el,
            compiler = this.compiler,
            partialObj  = compiler.getOption('partials', id),
            partial

        if (!partialObj) {
            if (id === 'yield') {
                utils.warn('{{>yield}} syntax has been deprecated. Use <content> tag instead.')
            }
            return
        }
        
        if (!partialObj.fragment) {
            partialObj.fragment = utils.toFragment(partialObj.template)
        }

        partial = partialObj.fragment.cloneNode(true)

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