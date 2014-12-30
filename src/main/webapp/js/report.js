function showSummaryChartPart(by, data, reportType) {
	console.log(data)
	var $e = $("#bodyPage");
	var $container = $e.find(".sectionOverviewSummary-chart .chart-content");
	if (typeof data == "undefined") {
		$container.html("");
		$container.append("<div class='noData'>No Data!</div>");
	} else {
		by = by || "day";

		// clear container
		$container.empty();
		$container.append("<div class='fstCon'></div><div class='secCon'></div>");

		// init series
		var openObj = {
			name : "Open Rate",
			data : [],
			color : "#9cb951"
		};
		var clickObj = {
			name : "Click Rate",
			data : [],
			color : "#6694bd"
		};

		var deliveredObj = {
			name : "Delivered",
			data : [],
			color : "#6694bd",
			borderColor : "#6694bd"
		};

		var failedObj = {
			name : "Failed",
			data : [],
			color : {
				linearGradient : [ "0%", "0%", "0%", "100%" ],
				stops : [ [ 0, '#FF6965' ], [ 1, '#AA4643' ] ]
			},
			borderColor : "#6E2D2B"
		};

		var categories = [];
		if (reportType == 'BATCH') {
			for (var i = 0; i < data.length; i++) {
				categories.push(data[i].date);
				openObj.data.push(smr.checkNumber(data[i].opens.uniqueRate));
				clickObj.data.push(smr.checkNumber(data[i].clicks.uniqueRate));
				deliveredObj.data.push(smr.checkNumber(data[i].delivered.count));
				failedObj.data.push(smr.checkNumber(data[i].failed.count));
			}
		} else {
			for (var i = 0; i < data.length; i++) {
				categories.push(data[i].date);
				openObj.data.push(smr.checkNumber(data[i].uniqueOpens.rate));
				clickObj.data.push(smr.checkNumber(data[i].uniqueClicks.rate));
				deliveredObj.data.push(smr.checkNumber(data[i].delivered.count));
				failedObj.data.push(smr.checkNumber(data[i].failed.count));
			}
		}
		// the first chart
		var fstChart = new Highcharts.Chart({
			chart : {
				renderTo : $container.find('.fstCon').get(0),
				defaultSeriesType : 'line',
				height : 150,
				marginLeft : 60,
				marginRight : 60,
				spacingTop : 0,
				spacingBottom : 6,
				backgroundColor : 'rgba(0,0,0,0)'
			},
			title : {
				text : "Open & Click Rates",
				align : 'left',
				x : 50,
				margin : 0,
				style : {
					color : '#303030',
					fontSize : '10.5pt',
					fontWeight : 'bold',
					fontFamily : 'Arial'
				}
			},
			xAxis : {
				categories : categories,
				gridLineWidth : 1,
				gridLineColor : '#cccccc',
				tickWidth : 0,
				title : {
					text : null
				},
				labels : {
					enabled : false,
					rotation : 325,
					x : -1,
					y : 28
				}
			},
			yAxis : {
				lineWidth : 1,
				gridLineWidth : 1,
				gridLineColor : '#e6e6e6',
				title : {
					text : null
				},
				labels : {
					formatter : function() {
						var showVal = smr.formatNumber(this.value, "short");
						showVal = showVal + "%";
						return showVal;
					}
				},
				min : 0
			},
			credits : {
				enabled : false
			},
			tooltip : {
				formatter : function() {
					var yVal = this.y;
					var val = (yVal >= 10) ? Highcharts.numberFormat(yVal, 1) : Highcharts.numberFormat(yVal, 2);
					yVal = val + "%";
					return '<span>' + this.x + '</span><br/>' + '<span>' + this.series.name + ': <b>' + yVal
							+ '</b></span>';
				}
			},
			plotOptions : {
				line : {
					marker : {
						enabled : true,
						symbol : 'circle',
						lineColor : '#FFFFFF',
						lineWidth : 2
					}
				},
				series : {
					shadow : false,
					animation : false,
				}
			},
			legend : {
				verticalAlign : 'top',
				borderWidth : 0,
				symbolWidth : 30,
				x : -20,
				y : -2
			},
			series : [ openObj, clickObj ]
		});

		// the second chart
		var secChart = new Highcharts.Chart({
			chart : {
				renderTo : $container.find('.secCon').get(0),
				defaultSeriesType : 'column',
				height : 130,
				marginLeft : 60,
				marginRight : 60,
				spacingTop : 0,
				spacingBottom : 6,
				backgroundColor : 'rgba(0,0,0,0)',
				events : {
					load : function() {
						$("#bodyPage").attr("load", "true");
					}
				}
			},
			title : {
				text : "Delivered & Failed",
				align : 'left',
				margin : 9,
				x : 50,
				style : {
					color : '#303030',
					fontSize : '10.5pt',
					fontWeight : 'bold',
					fontFamily : 'Arial'
				}
			},
			xAxis : {
				categories : categories,
				gridLineWidth : 1,
				gridLineColor : '#cccccc',
				tickLength : 0,
				title : {
					text : null
				},
				labels : {
					rotation : 325,
					step : Math.ceil(categories.length / 31),
					x : -1,
					y : 20,
					formatter : function() {
						var date = this.value;
						if (by == "day" || by == "week") {
							if (this.value != 0) {
								date = smr.formatDate(smr.parseDate(this.value), "MM-dd")
							} else {
								date = "null";
							}
						}
						return date;
					}
				}
			},
			yAxis : {
				lineWidth : 1,
				gridLineWidth : 1,
				gridLineColor : '#e6e6e6',
				title : {
					text : null,
					rotation : 0,
					x : 0
				},
				labels : {
					formatter : function() {
						return smr.formatNumber(this.value, "short");
					}
				},
				min : 0
			},
			credits : {
				enabled : false
			},
			tooltip : {
				formatter : function() {
					return '<span>' + this.x + '</span><br/>' + '<span>' + this.series.name + ': <b>'
							+ smr.formatNumber(this.y) + '</b></span>';
				}
			},
			plotOptions : {
				column : {
					borderRadius : 2,
					stacking : 'normal'
				},
				series : {
					shadow : false,
					animation : false
				}
			},
			legend : {
				enabled : false
			},
			series : [ failedObj, deliveredObj ]
		});

		// here re-draw the chart if the chart width not match the content
		var containerWidth = $container.find(".fstCon").width();
		var containerChartWidth = $container.find(".fstCon .highcharts-container").width();
		var diffValue = containerWidth - containerChartWidth;
		// if (diffValue > 5 && !view.reDraw) {
		// view.showView(view.viewName, _viewBy);
		// view.reDraw = true;
		// }
	}
}

function showBottomSummaryPart(by, data, reportType,conversionCurrency, conversionEnabled) {
	var view = this;
	var $e = $("#bodyPage");
	var $summary = $e.find(".sectionOverviewSummary-summary");
	var $table = $summary.find("table");
	var $funnel = $e.find(".sectionOverviewSummary-funnel");
	conversionEnabled = (conversionEnabled == "true") ? true : false;

	if (typeof data == "undefined") {
		$funnel.html("");
		$funnel.append("<div class='noData'>No Data!</div>");
	} else {
		// first init
		$table.find("tr:not(:first)").remove();
		$funnel.children(":not(.spanTitle)").remove();
		by = by || "day";

		// show table
		var tableData = getTableData(data, reportType, conversionEnabled);
		var barBreak = false;
		var rateBreak = false;
		var barValues = [];
		for (var i = 0; i < tableData.length; i++) {
			var summaryObj = tableData[i];
			if (!barBreak && !summaryObj.isBar) {
				var $tr = smr.render("tmpl-sectionOverviewSummary-summary-breakTr-tr", {});
				$table.append($tr);
				barBreak = true;
			}
			if (reportType == 'BATCH' || reportType == 'PROGRAM') {
				if (!rateBreak && summaryObj.label == "Unsub") {
					// brite.log.info(summaryObj);
					var $tr = smr.render("tmpl-sectionOverviewSummary-summary-breakTr-tr", {});
					$table.append($tr);
					rateBreak = true;
				}
			} else {
				if (!rateBreak && summaryObj.label == "Complaints") {
					// brite.log.info(summaryObj);
					var $tr = smr.render("tmpl-sectionOverviewSummary-summary-breakTr-tr", {});
					$table.append($tr);
					rateBreak = true;
				}
			}
			var showName = false;
			if (summaryObj.name == "unsub" || summaryObj.name == "unsubs" || summaryObj.name == "complaints"
					|| summaryObj.name == "clickToOpen") {
				showName = true;
			}
			var $tr = smr.render("tmpl-sectionOverviewSummary-summary-tr", {
				summaryObj : summaryObj,
				reportType : reportType,
				conversionCurrency : conversionCurrency,
				showName : showName
			});
			$table.append($tr);

			if (summaryObj.isRate == false) {
				$td = $table.find("tr[data-metric='" + summaryObj.name + "'] td.rate");
				// show bottom item
				var clickToOpenValue = smr.checkNumber(data.clickToOpen.uniqueRate);
				var clickToOpen = {
					label : "Click-To-Open",
					value : clickToOpenValue + "%",
					metric : "clickToOpen"
				};
				var $clickToOpen = smr.render("tmpl-sectionOverviewSummary-funnel-item", clickToOpen);
				$td.append($clickToOpen);

				var convertToClickValue = smr.checkNumber(data.convertToClick.rate);
				var convertToClick = {
					label : "Convert-To-Click",
					value : convertToClickValue + "%",
					metric : "convertToClick"
				};
				var $convertToClick = smr.render("tmpl-sectionOverviewSummary-funnel-item", convertToClick);
				$td.append($convertToClick);
			}

			if (summaryObj.isBar) {
				barValues.push({
					name : summaryObj.name,
					value : summaryObj.value
				});
			}
		}

		if (brite.ua.hasCanvas()) {
			for (var i = 0; i < barValues.length; i++) {
				// if(i + 1 == barValues.length){
				// barValues[i].value2 = 0;
				// }else{
				// barValues[i].value2 = barValues[i+1].value;
				// }
				if (i == 0) {
					barValues[i].value2 = 100;
				} else {
					barValues[i].value2 = barValues[i - 1].value;
				}
				drawBar($table, barValues[i]);
			}
		}
	}
}

// --------- Helper Functions ---------- //
function drawBar($table, metric) {
	var $tr = $table.find("tr[data-metric='" + metric.name + "']");
	var $bar = $tr.find(".funnel-bar .bar");
	$bar.append("<canvas width=0 height=0 ></canvas>");
	$bar.css("width", "100%");
	var gtx = brite.gtx($bar.find("canvas"));
	gtx.fitParent();
	var width = gtx.canvas().width;
	var height = gtx.canvas().height;
	var gradient = gtx.createLinearGradient(0, 5, width, 5);
	gradient.addColorStop(0.0, "#6694bd");
	gradient.addColorStop(0.5, "#6694bd");
	gradient.addColorStop(1.00, "#6694bd");
	var maxLeft = 1;
	var left1 = width * (1 - metric.value2 / 100) / 2;
	var left2 = width * (1 - metric.value / 100) / 2;
	if (left1 > width - 1 - left1) {
		left1 = width / 2 - maxLeft;
	}
	if (left2 > width - 1 - left2) {
		left2 = width / 2 - maxLeft;
	}

	gtx.beginPath();
	gtx.moveTo(left1, 1);
	gtx.lineTo(left2, height - 1);
	gtx.lineTo(width - 1 - left2, height - 1);
	gtx.lineTo(width - 1 - left1, 1);
	gtx.closePath();
	gtx.fillStyle(gradient);
	gtx.lineWidth(2);
	gtx.strokeStyle("#6694bd");
	gtx.stroke();
	gtx.fill();
}
function getTableData(data, reportType, conversionEnabled) {
	var batchTableNames = [];
	// only when conversionEnabled=true,should show Conversions and Revenue
	if (conversionEnabled) {
		batchTableNames = [ {
			label : 'Sent',
			name : 'sent',
			isBar : true,
			clickable : true
		}, {
			label : 'Delivered',
			name : 'delivered',
			isBar : true,
			clickable : true
		}, {
			label : 'Opens',
			name : 'opens',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Clicks',
			name : 'clicks',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Conversions',
			name : 'conversions',
			isBar : true,
			clickable : true
		}, {
			label : 'Revenue',
			name : 'revenue',
			isRate : false,
			clickable : true,
			isConversionSymbol : true
		}, {
			label : 'Unsub',
			name : 'unsub',
			uniqueOn : true,
			clickable : true
		}, {
			label : 'Complaints',
			name : 'complaints',
			uniqueOn : true,
			clickable : true
		} ];
	} else {
		batchTableNames = [ {
			label : 'Sent',
			name : 'sent',
			isBar : true,
			clickable : true
		}, {
			label : 'Delivered',
			name : 'delivered',
			isBar : true,
			clickable : true
		}, {
			label : 'Opens',
			name : 'opens',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Clicks',
			name : 'clicks',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Click-To-Open',
			name : 'clickToOpen',
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Unsub',
			name : 'unsub',
			uniqueOn : true,
			clickable : true
		}, {
			label : 'Complaints',
			name : 'complaints',
			uniqueOn : true,
			clickable : true
		} ];
	}
	// only when conversionEnabled=true,should show Conversions and Revenue
	var transactionalTableNames = [];
	if (conversionEnabled) {
		transactionalTableNames = [ {
			label : 'Sent',
			name : 'sent',
			isBar : true,
			clickable : true
		}, {
			label : 'Delivered',
			name : 'delivered',
			isBar : true,
			clickable : true
		}, {
			label : 'Opens',
			name : 'opens',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Clicks',
			name : 'clicks',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Conversions',
			name : 'conversions',
			isBar : true,
			clickable : true
		}, {
			label : 'Revenue',
			name : 'revenue',
			isRate : false,
			clickable : true,
			isConversionSymbol : true
		},
		// {label:'Unsub',name:'unsubs',uniqueOn:true,clickable:true},
		{
			label : 'Complaints',
			name : 'complaints',
			uniqueOn : true,
			clickable : true
		} ];
	} else {
		transactionalTableNames = [ {
			label : 'Sent',
			name : 'sent',
			isBar : true,
			clickable : true
		}, {
			label : 'Delivered',
			name : 'delivered',
			isBar : true,
			clickable : true
		}, {
			label : 'Opens',
			name : 'opens',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Clicks',
			name : 'clicks',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Click-To-Open',
			name : 'clickToOpen',
			clickable : true,
			uniqueOn : true
		},
		// {label:'Unsub',name:'unsubs',uniqueOn:true,clickable:true},
		{
			label : 'Complaints',
			name : 'complaints',
			uniqueOn : true,
			clickable : true
		} ];
	}

	// only when conversionEnabled=true,should show Conversions and Revenue
	var programTableNames = [];
	if (conversionEnabled) {
		programTableNames = [ {
			label : 'Sent',
			name : 'sent',
			isBar : true,
			clickable : true
		}, {
			label : 'Delivered',
			name : 'delivered',
			isBar : true,
			clickable : true
		}, {
			label : 'Opens',
			name : 'opens',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Clicks',
			name : 'clicks',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Conversions',
			name : 'conversions',
			isBar : true,
			clickable : true
		}, {
			label : 'Revenue',
			name : 'revenue',
			isRate : false,
			clickable : true,
			isConversionSymbol : true
		}, {
			label : 'Unsub',
			name : 'unsubs',
			uniqueOn : true,
			clickable : true
		}, {
			label : 'Complaints',
			name : 'complaints',
			uniqueOn : true,
			clickable : true
		} ];
	} else {
		programTableNames = [ {
			label : 'Sent',
			name : 'sent',
			isBar : true,
			clickable : true
		}, {
			label : 'Delivered',
			name : 'delivered',
			isBar : true,
			clickable : true
		}, {
			label : 'Opens',
			name : 'opens',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Clicks',
			name : 'clicks',
			isBar : true,
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Click-To-Open',
			name : 'clickToOpen',
			clickable : true,
			uniqueOn : true
		}, {
			label : 'Unsub',
			name : 'unsubs',
			uniqueOn : true,
			clickable : true
		}, {
			label : 'Complaints',
			name : 'complaints',
			uniqueOn : true,
			clickable : true
		} ];
	}

	var tableNames = batchTableNames;
	if (reportType == 'TRANSACTIONAL') {
		tableNames = transactionalTableNames;
	} else if (reportType == 'PROGRAM') {
		tableNames = programTableNames;
	}

	var tableData = [];
	for (var i = 0; i < tableNames.length; i++) {
		var obj = "";
		var summaryObj = $.extend({}, tableNames[i]);
		if (summaryObj.uniqueOn) {
			var objName = tableNames[i].name;
			if (objName == "clickToOpen") {
				obj = data[objName];
				summaryObj.count = "";
				summaryObj.value = smr.checkNumber(obj.uniqueRate);
			} else {
				if (reportType == 'BATCH') {
					obj = data[objName];
					if (obj && obj.unique) {
						summaryObj.count = smr.formatNumber(obj.unique);
					}
					if (obj && obj.uniqueRate) {
						summaryObj.value = smr.checkNumber(obj.uniqueRate);
					}
				} else {
					var uName = "unique" + objName.substring(0, 1).toUpperCase() + objName.substring(1);
					obj = data[uName];
					if (obj && obj.count) {
						summaryObj.count = smr.formatNumber(obj.count);
					}
					if (obj && obj.rate) {
						summaryObj.value = smr.checkNumber(obj.rate);
					}
				}
			}
		} else {
			// right now in the new data format,we did not have revenue,it have
			// put into the conversions
			if (summaryObj.name == "revenue") {
				obj = data["conversions"];
				summaryObj.count = smr.formatNumber(obj.revenue);
				summaryObj.value = null;
			} else {
				obj = data[tableNames[i].name];
				summaryObj.count = smr.formatNumber(obj.count);
				summaryObj.value = smr.checkNumber(obj.rate);
			}
		}
		if (summaryObj.name == "sent") {
			summaryObj.value = 100;
		}
		// FIXME for now, just use i to test up or down
		summaryObj.upOrDown = i % 2 ? true : false;

		if (summaryObj.value != null) {
			summaryObj.rate = summaryObj.value + "%";
		} else {
			summaryObj.rate = "";
		}

		tableData.push(summaryObj);
	}
	return tableData;
}

//
// $(function() {
// var json = "getBatchSummary-breakdownbyday1.jso";
// app.ajaxRequest(app.host + "/getReportData", {
// json : json
// }, "POST").pipe(function(val) {
// console.log(val)
// if (val.success == true) {
// showSummaryChartPart('day', val.result.items[0].data);
// showBottomSummaryPart('day', val.result.items[0].summary)
// } else {
// }
// });
// })
