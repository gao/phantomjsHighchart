

(function () {
	"use strict";

	var config = {
			/* define locations of mandatory javascript files */
			files: { 
				JQUERY: 'jquery.1.9.1.min.js',
				HIGHCHARTS: 'highstock.js',
				HIGHCHARTS_MORE: 'highcharts-more.js',
				HIGHCHARTS_DATA: 'data.js',
				HIGHCHARTS_DRILLDOWN: 'drilldown.js',
				HIGHCHARTS_FUNNEL: 'funnel.js',
				HIGHCHARTS_HEATMAP: 'heatmap.js',
				HIGHCHARTS_3D: 'highcharts-3d.js',
				HIGHCHARTS_NODATA: 'no-data-to-display.js',
				/*HIGHCHARTS_MAP: 'map.js',*/
				HIGHCHARTS_SOLID_GAUGE: 'solid-gauge.js'
			},
			TIMEOUT: 2000 /* 2 seconds timout for loading images */
		},
		mapCLArguments,
		render,
		startServer = false,
		args,
		pick,
		SVG_DOCTYPE = '<?xml version=\"1.0" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">',
		dpiCorrection = 1.4,
		system = require('system'),
		serverMode = false;

		
pick = function () {
		var args = arguments, i, arg, length = args.length;
		for (i = 0; i < length; i += 1) {
			arg = args[i];
			if (arg !== undefined && arg !== null && arg !== 'null' && arg != '0') {
				return arg;
			}
		}
	};
		
		mapCLArguments = function () {
		var map = {},
			i,
			key;


		for (i = 0; i < system.args.length; i += 1) {
			if (system.args[i].charAt(0) === '-') {
				key = system.args[i].substr(1, i.length);
					map[key] = system.args[i + 1];
			}
		}
		return map;
	};
		
	render = function (params, exitCallback) {
	var page = require('webpage').create(),messages = {};
	messages.imagesLoaded = 'Highcharts.images.loaded';
		messages.optionsParsed = 'Highcharts.options.parsed';
		messages.callbackParsed = 'Highcharts.cb.parsed';
		window.imagesLoaded = false;
		window.optionsParsed = false;
		window.callbackParsed = false;

		page.onConsoleMessage = function (msg) {
			console.log(msg);

			/*
			 * Ugly hack, but only way to get messages out of the 'page.evaluate()'
			 * sandbox. If any, please contribute with improvements on this!
			 */

			if (msg === messages.imagesLoaded) {
				window.imagesLoaded = true;
			}
			/* more ugly hacks, to check options or callback are properly parsed */
			if (msg === messages.optionsParsed) {
				window.optionsParsed = true;
			}

			if (msg === messages.callbackParsed) {
				window.callbackParsed = true;
			}
		};

		page.onAlert = function (msg) {
			//console.log(msg);
		};
		
		
		
		page.open(params.address, function (status) {	
        	if (status !== 'success') {
				phantom.exit();
        	} else {
            window.setTimeout(function () {
                page.render(params.output);
				if (serverMode) {
				page.close();
			}
			exitCallback("success");
                //phantom.exit();
            }, 500);
        	}
   		 });
		
	};



startServer = function (host, port) {
		var server = require('webserver').create();

		server.listen(host + ':' + port,
			function (request, response) {
				var jsonStr = request.post,
					params,
					msg;
				try {
					params = JSON.parse(jsonStr);
					if (params.status) {
						// for server health validation
						response.statusCode = 200;
						response.write('OK');
						response.close();
					} else {
						render(params, function (result) {
							response.statusCode = 200;
							response.write(result);
							response.close();
						});
					}
				} catch (e) {
					msg = "Failed rendering: \n" + e;
					response.statusCode = 500;
					response.setHeader('Content-Type', 'text/plain');
					response.setHeader('Content-Length', msg.length);
					response.write(msg);
					response.close();
				}
			}); // end server.listen

		// switch to serverMode
		serverMode = true;

		console.log("OK, PhantomJS is ready.");
	};
	
	args = mapCLArguments();

	if (args.host !== undefined && args.port !== undefined) {
		startServer(args.host, args.port);
	} else {
		// presume commandline usage
		render(args, function (msg) {
			//console.log(msg);
			phantom.exit();
		});
	}
}());
