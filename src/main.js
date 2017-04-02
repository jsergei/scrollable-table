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

document.addEventListener('DOMContentLoaded', function () {
	ko.applyBindings(MyApp.tableViewModel, document.body);;
})
