var Global = Global || {};

(function (constants) {
	var parentDiv = document.createElement('div');
	parentDiv.style.cssText = 'overflow-y: scroll; width: 100px; height: 100px; visibility: hidden;';
	var childDiv = document.createElement('div');
	childDiv.style.cssText = 'height: 150px;';
	parentDiv.appendChild(childDiv);

	document.body.appendChild(parentDiv);

	constants.scrollWidth = parentDiv.offsetWidth - childDiv.offsetWidth;

	parentDiv.outerHTML = "";
	delete parentDiv;
}(Global.constants = Global.constants || {}));

(function (g) {
	var scrollSpace = document.getElementsByClassName('scroll-space')[0];
	if (scrollSpace) {
		scrollSpace.style.width = g.constants.scrollWidth + 'px';
	}
}(Global));
