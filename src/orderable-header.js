var stNamespace = stNamespace || {};

(function (ns) {
	var constants = ns.constants;

	ko.bindingHandlers.orderableHeader = {
		init: function(element, valueAccessor) {
			var args = valueAccessor(),
				scrollSpace = args.scrollSpace,
				onOrder = args.onOrder,
				orderableRow = element.querySelector('tr:last-child'),
				orderableHeaders = orderableRow.querySelectorAll('th[' + constants.orderKeyAttr + ']'),
				i = 0, j = 0;

			if (!orderableHeaders.length)
				return;

			var touchesScrollSpace = orderableHeaders[orderableHeaders.length - 1] === orderableRow.querySelector('th:last-child');
			var connectedToScrollTh = orderableHeaders[orderableHeaders.length - 1];

			var clickTh = function (th) {
				var key = parseInt(th.getAttribute(constants.orderKeyAttr), 10),
					direction = constants.directionUp;

				if (ns.hasClass(th, constants.arrowUp)) {
					ns.removeClass(th, constants.arrowUp);
					ns.addClass(th, constants.arrowDown);
					direction = constants.directionDown;
				} else if (ns.hasClass(th, constants.arrowDown)) {
					ns.removeClass(th, constants.arrowDown);
					ns.addClass(th, constants.arrowUp);
					direction = constants.directionUp;
				} else {
					for (i = 0; i < orderableHeaders.length; i++) {
						ns.removeClass(orderableHeaders[i], constants.arrowUp);
						ns.removeClass(orderableHeaders[i], constants.arrowDown);
					}

					ns.addClass(th, constants.arrowUp);
					direction = constants.directionUp;
				}

				onOrder({ key: key, direction: direction });
			};

			orderableRow.addEventListener('click', function (e) {
				var th = ns.getParentWithAttr(e.target, constants.orderKeyAttr, orderableRow);
				if (th) {
					clickTh(th);
				}
			}, false);

			orderableRow.addEventListener('mousedown', function (e) {
				var th = ns.getParentWithAttr(e.target, constants.orderKeyAttr, orderableRow);
				if (th) {
					ns.addClass(th, constants.beingClicked);
					if (touchesScrollSpace && connectedToScrollTh === th) {
						ns.addClass(scrollSpace, constants.beingClicked);
					}
				}
			}, false);

			orderableRow.addEventListener('mouseup', function () {
				for (i = 0; i < orderableHeaders.length; i++) {
					ns.removeClass(orderableHeaders[i], constants.beingClicked);
				}
				ns.removeClass(scrollSpace, constants.beingClicked);
			}, false);

			if (touchesScrollSpace) {
				scrollSpace.addEventListener('click', function (e) {
					clickTh(connectedToScrollTh);
				}, false);

				scrollSpace.addEventListener('mousedown', function (e) {
					ns.addClass(scrollSpace, constants.beingClicked);
					ns.addClass(connectedToScrollTh, constants.beingClicked);
				}, false);

				scrollSpace.addEventListener('mouseup', function (e) {
					ns.removeClass(scrollSpace, constants.beingClicked);
					ns.removeClass(connectedToScrollTh, constants.beingClicked);
				}, false);
			}

			for (i = 0; i < orderableHeaders.length; i++) {
				if (touchesScrollSpace && i === orderableHeaders.length - 1) {
					orderableHeaders[i].addEventListener('mouseenter', function (e) {
						ns.addClass(e.target, constants.thHovered);
						ns.addClass(scrollSpace, constants.thHovered);
					}, false);

					orderableHeaders[i].addEventListener('mouseleave', function (e) {
						ns.removeClass(e.target, constants.thHovered);
						ns.removeClass(scrollSpace, constants.thHovered);

						ns.removeClass(e.target, constants.beingClicked);
						ns.removeClass(scrollSpace, constants.beingClicked);
					}, false);
				} else {
					orderableHeaders[i].addEventListener('mouseenter', function (e) {
						ns.addClass(e.target, constants.thHovered);
					}, false);

					orderableHeaders[i].addEventListener('mouseleave', function (e) {
						ns.removeClass(e.target, constants.thHovered);
						ns.removeClass(e.target, constants.beingClicked);
					}, false);
				}
			}

			if (touchesScrollSpace) {
				scrollSpace.addEventListener('mouseenter', function (e) {
					ns.addClass(e.target, constants.thHovered);
					ns.addClass(connectedToScrollTh, constants.thHovered);
				}, false);

				scrollSpace.addEventListener('mouseleave', function (e) {
					ns.removeClass(e.target, constants.thHovered);
					ns.removeClass(connectedToScrollTh, constants.thHovered);
				}, false);
			}

			// init arrows
			ns.addClass(orderableHeaders[0], constants.arrowUp);
    }
	};

})(stNamespace);
