var MyApp = MyApp || {};

(function (app) {
	var TableViewModel = function (){
		this.headers = {
			itemPosition: 'Item Position',
			itemName: 'Item Name (ID)',
			meanMaxMark: 'Mean Mark / Max Mark',
			itemExposure: 'Item Exposure',
			attempted: 'Attempted',
			version: 'Version'
		};

		var ItemRow = function (values) {
			for (var x in values) {
				if (values.hasOwnProperty(x)) {
					this[x] = ko.observable(values[x]);
				}
			}

			this.itemName = ko.computed(function () {
				return this.name() + " " + this.contAuthorId();
			}, this);

			this.meanMaxMark = ko.computed(function () {
				return this.meanMark() + " / " + this.maxMark();
			}, this);

			this.attemptedProc = ko.computed(function () {
				return this.attempted() + " %";
			}, this);
		};

		var rows = [
			new ItemRow({ id: 1, name: 'MC', contAuthorId: 123, meanMark: 0.5, maxMark: 1, exposure: 3, attempted: 70, version: 1 }),
			new ItemRow({ id: 2, name: 'MR', contAuthorId: 444, meanMark: 0, maxMark: 2, exposure: 1, attempted: 100, version: 2 }),
			new ItemRow({ id: 3, name: 'Very very very very looooooooong name', contAuthorId: 78787, meanMark: 1, maxMark: 2, exposure: 5, attempted: 58, version: 1 })
		];

		var fillerRows = [];

		for (var i = 0; i < 10; i++) {
			fillerRows.push(new ItemRow({ id: i + 4, name: 'Item ' + (i + 4), contAuthorId: 1000 + (i + 4), meanMark: 1, maxMark: 3, exposure: i + 5, attempted: 45, version: 2 }));
		}

		this.rows = ko.observableArray(rows.concat(fillerRows));

		this.toggleRows = function () {
			if (this.rows().length != 3) {
				this.rows(rows);
			} else {
				this.rows(rows.concat(fillerRows));
			}
		};
	};

	app.tableViewModel = new TableViewModel();
}(MyApp));

(function () {
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

		jElem.prepend($.parseHTML(tableTemplate));
		jElem.find('.head-table').append(head);
		jElem.find('.body-table-container > table').append(body);

		table.remove();
	}

	function setScrollWidth(jElem) {
		var bodyContainer = jElem.find('.body-table-container');
		var table = jElem.find('.body-table-container > table');
		var width = bodyContainer.width() - table.width();
		jElem.find('.scroll-space').width(width + 'px');
	}

	function drawBottomLines(jElem, rows) {
		var bodyContainer = jElem.find('.body-table-container');
		var table = jElem.find('.body-table-container > table');
		var heightDiff = bodyContainer.height() - table.find('tbody').height();
		if (heightDiff > 0) {
			var columnNum = jElem.find('.head-table tr:last-child th').length;
			var foot = $.parseHTML('<tfoot><tr>' + new Array(columnNum + 1).join('<td></td>') + '</tr></tfoot>');
			table.append(foot);
			table.find('tfoot tr').height(heightDiff);
		} else {
			table.find('tfoot').remove();
		}
	}

	ko.bindingHandlers.scrollableTable = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
				console.log('init');

				var jElem = $(element);
				wrapUpIntoTemplate(jElem)
				ko.applyBindingsToDescendants(bindingContext, element);

				setScrollWidth(jElem);
				drawBottomLines(jElem, valueAccessor()());

				valueAccessor().subscribe(function (rows) {
					setScrollWidth(jElem);
					drawBottomLines(jElem, rows);
				}, this);

				return { controlsDescendantBindings: true };
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
				console.log('update');
	    }
	};
})();

ko.applyBindings(MyApp.tableViewModel, document.getElementsByTagName('body')[0]);
