(function () {
	ko.bindingHandlers.afterForeachDomUpdate = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var arg = valueAccessor(),
				func = typeof arg === 'function' ? arg : function ()  {};
			allBindings().foreach.subscribe(function (newValue) {
				func();
			});
			func();
    }
	};

	var tableTemplate =
		'<table class="container-table">' +
		  '<tr>' +
		    '<td>' +
		       '<table class="head-table">' +
		       '</table>' +
		    '</td>' +
				'<td class="scroll-space"></td>' +
		  '</tr>' +
		  '<tr>' +
		    '<td colspan="2">' +
		       '<div class="body-table-container">' +
		         '<table>' +
		         '</table>' +
		       '</div>' +
		    '</td>' +
		  '</tr>' +
		'</table>';

	function wrapUpIntoTemplate(jElem) {
		jElem.addClass('container');

		var table = jElem.find('table');
		var head = table.find('thead').detach();
		var body = table.find('tbody').detach();

		body.attr('data-bind', 'foreach: rows, afterForeachDomUpdate: afterDomUpdate');

		jElem.prepend($.parseHTML(tableTemplate));
		jElem.find('.head-table').append(head);
		jElem.find('.body-table-container > table').append(body);

		table.remove();
	}

	function setScrollWidth(jElem) {
		var bodyContainer = jElem.find('.body-table-container')[0];
		var table = jElem.find('.body-table-container > table')[0];
		var width = bodyContainer.offsetWidth - table.offsetWidth;
		jElem.find('.scroll-space').width(width + 'px');
	}

	function drawBottomLines(jElem) {
		var bodyContainer = jElem.find('.body-table-container');
		var table = jElem.find('.body-table-container > table');
		var heightDiff = bodyContainer[0].offsetHeight - table.find('tbody')[0].offsetHeight;
		if (heightDiff > 0) {
			var columnNum = jElem.find('.head-table tr:last-child th').length;
			var foot = $.parseHTML('<tfoot><tr>' + new Array(columnNum + 1).join('<td></td>') + '</tr></tfoot>');
			table.append(foot);
			table.find('tfoot tr').height(heightDiff + 'px');
		} else {
			table.find('tfoot').remove();
		}
	}

	ko.bindingHandlers.scrollableTable = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
				var jElem = $(element);
				wrapUpIntoTemplate(jElem);

				var innerBindingContext = bindingContext.extend({
					rows: valueAccessor(),
					afterDomUpdate: function () {
						setScrollWidth(jElem);
						drawBottomLines(jElem);
					}
				});
				ko.applyBindingsToDescendants(innerBindingContext, element);

				return { controlsDescendantBindings: true };
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	    }
	};
})();
