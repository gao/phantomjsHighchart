var page = require('webpage').create();
var system = require('system');
var url = system.args[1];
var uri = system.args[2];
var imageName = system.args[3];
var json = system.args[4];
var reportType = system.args[5];
var reportName = system.args[6];
var pdfName = system.args[7];
var conversionCurrency = system.args[8];
var conversionEnabled = system.args[9];

 phantom.onError = function(msg, trace) {
 	var msgStack = ['PHANTOM ERROR: ' + msg];
 	if (trace && trace.length) {
 		msgStack.push('TRACE:');
 		trace.forEach(function(t) {
 			msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
 		});
 	}
 	console.error(msgStack.join('\n'));
 	phantom.exit(1);
 };


 page.viewportSize = {
 	width : 1300,
 	height : 900
 };

 var fs = require('fs');
 var content = fs.read(json);
 var obj = JSON.parse(content);

 page.open(url + uri, function() {	
 	var title = "";
 	if (reportType == "BATCH") {
 		title = ("Batch Mailing Report: " + reportName);
 	}
 	if (reportType == "TRANSACTIONAL") {
 		title = ("Transactional Mailing Report: " + reportName);
 	}
 	if (reportType == "PROGRAM") {
 		title = ("Lifecycle Program Report: " + reportName);
 	}
 	obj.title = title;
 	obj.reportType = reportType;
 	obj.conversionEnabled = (typeof conversionCurrency !== "undefined" && conversionCurrency !== null) ? conversionEnabled : "true";
 	obj.conversionCurrency =  (typeof conversionCurrency !== "undefined" && conversionCurrency !== null) ? conversionCurrency : "$";
 	page.includeJs(url + '/js/report.js', function() {
 		doReport(page, obj);
 	});
 	window.setTimeout(function() {
 		page.render(imageName,{format: 'png', quality: '70'});
 		if (typeof pdfName !== "undefined" && pdfName !== null) {
 			page.evaluate(function () {
 				var paths = document.getElementsByTagName("path");
 				for (var i = paths.length - 1; i >= 0; i--) {
 					var path = paths[i];
 					var strokeOpacity = path.getAttribute('stroke-opacity');
 					if (strokeOpacity != null && strokeOpacity < 0.2){
 						path.parentNode.removeChild(path);
 					}
 				}
 			});
 			page.paperSize={format: 'A4',orientation: 'landscape',margin: '1cm'};
 			page.render(pdfName,{format: 'pdf', quality: '100'});
 		}
 		console.log("SUCCESS");
 		phantom.exit();
 	}, 6000);

 });

function doReport(page, json) {
	page.evaluate(function(json) {
		showSummaryChartPart('day', json.items[0].data, json.reportType);
		showBottomSummaryPart('day', json.items[0].summary, json.reportType, json.conversionCurrency,json.conversionEnabled);
		$("#reportTitle").html(json.title);
	}, json);
}

