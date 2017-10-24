function gotoPage(page) {
	var url = document.location.protocol + '//' + document.location.host;
	url += '/'+page;
	document.location.href = url;
}