/* This JavaScript file is intended only for the following:
*
* - Specific simple functions for the L A B O site itself
* - Demonstration of how the benglabs.js library can be used within a normal webpage (see components.html)
*/

function gotoPage(page) {
	var url = document.location.protocol + '//' + document.location.host;
	url += '/'+page;
	document.location.href = url;
}