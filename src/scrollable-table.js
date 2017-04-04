var stNamespace = stNamespace || {};

(function (ns) {
	var constants = ns.constants;

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
		ns.addClass(el, 'container');

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
		if (ns.hasClass(el, constants.tableOrderable)) {
			theadClone.setAttribute('data-bind', 'orderableHeader: {scrollSpace: scrollSpace, onOrder: onOrder}');
		}
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
				ns.clean(element);
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
})(stNamespace);
