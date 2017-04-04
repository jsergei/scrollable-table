(function () {
	var constants = {
		thHovered: 'head-hover',
		orderKeyAttr: 'data-orderkey',
		arrowUp: 'st-arrow-up',
		arrowDown: 'st-arrow-down',
		beingClicked: 'st-mousedown',
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

	function addClass(element, cls) {
		if (!hasClass(element, cls)) {
			element.className = element.className.length ? (element.className + ' ' + cls) : cls;
		}
	}

	function hasClass(element, cls) {
    return element.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}

	function removeClass(element, cls) {
    if (hasClass(element, cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      element.className = element.className.replace(reg, ' ').trim();
    }
  }

	function getParentWithAttr(element, parentAttr, topParent) {
		if (element.hasAttribute(parentAttr)) {
			return element;
		} else if (element !== topParent && element.parentNode) {
			return getParentWithAttr(element.parentNode, parentAttr);
		} else {
			return null;
		}
	}

	ko.bindingHandlers.orderableHeader = {
		init: function(element, valueAccessor) {
			var args = valueAccessor(),
				scrollSpace = args.scrollSpace,
				onOrder = args.onOrder,
				orderableRow = element.querySelector('tr:last-child'),
				orderableHeaders = orderableRow.querySelectorAll('th[data-orderkey]'),
				i = 0, j = 0;

			if (!orderableHeaders.length)
				return;

			var touchesScrollSpace = orderableHeaders[orderableHeaders.length - 1] === orderableRow.querySelector('th:last-child');
			var connectedToScrollTh = orderableHeaders[orderableHeaders.length - 1];

			var clickTh = function (th) {
				var key = parseInt(th.getAttribute(constants.orderKeyAttr), 10),
					direction = constants.directionUp;

				if (hasClass(th, constants.arrowUp)) {
					removeClass(th, constants.arrowUp);
					addClass(th, constants.arrowDown);
					direction = constants.directionDown;
				} else if (hasClass(th, constants.arrowDown)) {
					removeClass(th, constants.arrowDown);
					addClass(th, constants.arrowUp);
					direction = constants.directionUp;
				} else {
					for (i = 0; i < orderableHeaders.length; i++) {
						removeClass(orderableHeaders[i], constants.arrowUp);
						removeClass(orderableHeaders[i], constants.arrowDown);
					}

					addClass(th, constants.arrowUp);
					direction = constants.directionUp;
				}

				onOrder({ key: key, direction: direction });
			};

			orderableRow.addEventListener('click', function (e) {
				var th = getParentWithAttr(e.target, constants.orderKeyAttr, orderableRow);
				if (th) {
					clickTh(th);
				}
			}, false);

			orderableRow.addEventListener('mousedown', function (e) {
				var th = getParentWithAttr(e.target, constants.orderKeyAttr, orderableRow);
				if (th) {
					addClass(th, constants.beingClicked);
					if (touchesScrollSpace && connectedToScrollTh === th) {
						addClass(scrollSpace, constants.beingClicked);
					}
				}
			}, false);

			orderableRow.addEventListener('mouseup', function () {
				for (i = 0; i < orderableHeaders.length; i++) {
					removeClass(orderableHeaders[i], constants.beingClicked);
				}
				removeClass(scrollSpace, constants.beingClicked);
			}, false);

			if (touchesScrollSpace) {
				scrollSpace.addEventListener('click', function (e) {
					clickTh(connectedToScrollTh);
				}, false);

				scrollSpace.addEventListener('mousedown', function (e) {
					addClass(scrollSpace, constants.beingClicked);
					addClass(connectedToScrollTh, constants.beingClicked);
				}, false);

				scrollSpace.addEventListener('mouseup', function (e) {
					removeClass(scrollSpace, constants.beingClicked);
					removeClass(connectedToScrollTh, constants.beingClicked);
				}, false);
			}

			for (i = 0; i < orderableHeaders.length; i++) {
				if (touchesScrollSpace && i === orderableHeaders.length - 1) {
					orderableHeaders[i].addEventListener('mouseenter', function (e) {
						addClass(e.target, constants.thHovered);
						addClass(scrollSpace, constants.thHovered);
					}, false);

					orderableHeaders[i].addEventListener('mouseleave', function (e) {
						removeClass(e.target, constants.thHovered);
						removeClass(scrollSpace, constants.thHovered);

						removeClass(e.target, constants.beingClicked);
						removeClass(scrollSpace, constants.beingClicked);
					}, false);
				} else {
					orderableHeaders[i].addEventListener('mouseenter', function (e) {
						addClass(e.target, constants.thHovered);
					}, false);

					orderableHeaders[i].addEventListener('mouseleave', function (e) {
						removeClass(e.target, constants.thHovered);
						removeClass(e.target, constants.beingClicked);
					}, false);
				}
			}

			if (touchesScrollSpace) {
				scrollSpace.addEventListener('mouseenter', function (e) {
					addClass(e.target, constants.thHovered);
					addClass(connectedToScrollTh, constants.thHovered);
				}, false);

				scrollSpace.addEventListener('mouseleave', function (e) {
					removeClass(e.target, constants.thHovered);
					removeClass(connectedToScrollTh, constants.thHovered);
				}, false);
			}

			// init arrows
			addClass(orderableHeaders[0], constants.arrowUp);
    }
	};


	var tableTemplate =
		'<table class="container-table">' +
		  '<tr>' +
		    '<td>' +
		       '<table class="head-table">' +
		       '</table>' +
		    '</td>' +
				'<td class="scroll-space" style="width: 0"></td>' +
		  '</tr>' +
		  '<tr>' +
		    '<td colspan="2">' +
		       '<div class="body-table-container">' +
		         '<table class="body-table">' +
		         '</table>' +
		       '</div>' +
		    '</td>' +
		  '</tr>' +
		'</table>';

	function clean(node) {
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
	}

	function validateSourceTemplateStructure(el) {
		if (el.childElementCount !== 1 || el.firstChild.tagName.toLowerCase() !== 'table')
			throw new Error("There must be only one child table in the container and it must be an immidiate child.");

		if (el.querySelectorAll('thead th').length < 1)
			throw new Error("The table must have at least one th element.");

		if (el.querySelectorAll('tbody td').length < 1)
			throw new Error("The table must have at least one td element.");

		if (el.querySelectorAll('tbody td').length !== el.querySelectorAll('thead th').length)
			throw new Error("The number of th and td elements must match.");
	}

	function createFooter(el) {
		var columnNum = el.querySelectorAll('.head-table tr:last-child th').length;
		var footer = document.createElement('tfoot');
		var tr = document.createElement('tr');
		footer.appendChild(tr);
		for (var i = 1; i <= columnNum; i++) {
			tr.appendChild(document.createElement('td'));
		}
		return footer;
	}

	function showFooter(selectors, height, isEmpty) {
		selectors.footer.style.display = "table-row-group";
		selectors.footerRow.style.height = height + 'px';
		selectors.footer.className = isEmpty ? 'no-rows' : '';
	}

	function hideFooter(selectors) {
		selectors.footer.style.display = "none";
		selectors.footerRow.style.height = 0;
		selectors.footer.className = '';
	}

	function wrapUpIntoTemplate(el) {
		el.className += ' container';

		// Init a document fragment with a prepared html template.
		var frg = document.createDocumentFragment();
		frg.appendChild(document.createElement('div'));
		frg.firstChild.innerHTML = tableTemplate;
		frg.appendChild(frg.firstChild.firstChild);
		frg.removeChild(frg.firstChild);

		// Copy exising classes into the root.
		frg.firstChild.className += el.firstChild.className;

		var colGroup = el.querySelector('colgroup');

		// Clone and move the exsiting head.
		var theadClone = el.querySelector('table thead').cloneNode(true);
		var thead = frg.querySelector('.head-table');
		if (colGroup) {
			thead.appendChild(colGroup.cloneNode(true));
		}
		theadClone.setAttribute('data-bind', 'orderableHeader: {scrollSpace: scrollSpace, onOrder: onOrder}');
		thead.appendChild(theadClone);

		// Clone and move the existing body.
		var tbodyClone = el.querySelector('table tbody').cloneNode(true);
		tbodyClone.setAttribute('data-bind', 'foreach: rows, afterForeachDomUpdate: {init: afterDomInit, update: afterDomUpdate}');
		var tbody = frg.querySelector('.body-table');
		if (colGroup) {
			tbody.appendChild(colGroup.cloneNode(true));
		}
		tbody.appendChild(tbodyClone);
		tbody.appendChild(createFooter(frg));
		hideFooter({
			footer: frg.querySelector('.body-table tfoot'),
			footerRow: frg.querySelector('.body-table tfoot tr')
		});

		el.replaceChild(frg, el.firstChild);

		return {
			root: el,
			rootHeaderRow: el.querySelector('.container-table > tbody > tr:first-child'),
			headerTable: el.querySelector('.head-table'),
			scrollSpace: el.querySelector('.scroll-space'),
			bodyContainer: el.querySelector('.body-table-container'),
			bodyTable: el.querySelector('.body-table'),
			body: el.querySelector('.body-table tbody'),
			footer: el.querySelector('.body-table tfoot'),
			footerRow: el.querySelector('.body-table tfoot tr')
		};
	}

	function setScrollWidth(selectors) {
		var widthDiff = selectors.bodyContainer.offsetWidth - selectors.bodyTable.offsetWidth;
		selectors.scrollSpace.style.width = widthDiff + 'px';
	}

	function drawBottomLines(selectors) {
		var heightDiff = selectors.bodyContainer.offsetHeight - selectors.body.offsetHeight;
		if (heightDiff > 0) {
			showFooter(selectors, heightDiff, selectors.body.childElementCount === 0);
		} else {
			hideFooter(selectors);
		}
	}

	function setBodyContainerHeight(selectors) {
		var rootH = selectors.root.offsetHeight,
			rootHeaderRowH = selectors.rootHeaderRow.offsetHeight,
			bordersSumH = 3;
		selectors.bodyContainer.style.height = rootH - rootHeaderRowH - bordersSumH + 'px';
	}

	ko.bindingHandlers.scrollableTable = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
				clean(element);
				validateSourceTemplateStructure(element);
				var selectors = wrapUpIntoTemplate(element);

				var updateAll = function () {
					setBodyContainerHeight(selectors);
					drawBottomLines(selectors);
					setScrollWidth(selectors);
				};

				var orderNotifier = allBindings().orderNotifier;
				var onOrder = orderNotifier && ko.isObservable(orderNotifier)
					? function (order) { orderNotifier(order); }
					: function () {};

				var innerBindingContext = bindingContext.extend({
					scrollSpace: selectors.scrollSpace,
					onOrder: onOrder,
					rows: valueAccessor(),
					afterDomInit: updateAll,
					afterDomUpdate: function () {
						drawBottomLines(selectors);
						setScrollWidth(selectors);
					}
				});

				var resizeListener = allBindings().resizeListener;
				if (resizeListener && ko.isObservable(resizeListener)) {
					resizeListener.subscribe(updateAll);
				}

				ko.applyBindingsToDescendants(innerBindingContext, element);

				return { controlsDescendantBindings: true };
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    }
	};
})();
