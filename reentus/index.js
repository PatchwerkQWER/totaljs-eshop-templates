exports.install = function() {
	MERGE('/reentus/js/default.js', '=reentus/public/js/ui.js', '=reentus/public/js/default.js');
	MERGE('/reentus/css/default.css', '=reentus/public/css/ui.css', '=reentus/public/css/default.css');
	LOCALIZE('/reentus/widgets/*.html');
};
