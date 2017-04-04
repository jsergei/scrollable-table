var stNamespace = stNamespace || {};

(function (ns) {

	ns.constants = {
		thHovered: 'st-hover',
		orderKeyAttr: 'data-orderkey',
		arrowUp: 'st-arrow-up',
		arrowDown: 'st-arrow-down',
		beingClicked: 'st-mousedown',
    tableOrderable: 'table-orderable',
		directionUp: 0,
		directionDown: 1
	};

	ko.bindingHandlers.afterForeachDomUpdate = {
		init: function(element, valueAccessor, allBindings) {
			var arg = valueAccessor();
			allBindings().foreach.subscribe(function (newValue) {
				arg.update();
			});
			arg.init();
    }
	};

	ns.addClass = function(element, cls) {
		if (!ns.hasClass(element, cls)) {
			element.className = element.className.length ? (element.className + ' ' + cls) : cls;
		}
	};

	ns.hasClass = function(element, cls) {
    return element.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	};

	ns.removeClass = function(element, cls) {
    if (ns.hasClass(element, cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      element.className = element.className.replace(reg, ' ').trim();
    }
  };

	ns.getParentWithAttr = function getParentWithAttr(element, parentAttr, topParent) {
		if (element.hasAttribute(parentAttr)) {
			return element;
		} else if (element !== topParent && element.parentNode) {
			return getParentWithAttr(element.parentNode, parentAttr);
		} else {
			return null;
		}
	};

  ns.clean = function clean(node) {
		for(var n = 0; n < node.childNodes.length; n ++) {
			var child = node.childNodes[n];
			if (child.nodeType === 8 ||
				(child.nodeType === 3 && !/\S/.test(child.nodeValue)))
			{
				node.removeChild(child);
				n --;
			}
			else if(child.nodeType === 1) {
				clean(child);
			}
		}
	};

})(stNamespace);
