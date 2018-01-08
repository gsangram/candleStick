function loadCandleChart(options) {
    if (options) {
        this.data = options.data ? options.data : [];
        this.container = options.container ? options.container : "body";
        this.height = options.height ? options.height : 400;
        this.width = options.width ? options.width : 800;
        options.plot = {
            width: this.width - options.margin.left - options.margin.right,
            height: this.height - options.margin.top - options.margin.bottom,
        };
    } else {
        console.error('candleStick Chart Initialization Error : candleStick Chart Params Not Defined');
        return false;
    }
    ;
    // on click of dropdown 
    $(".dropdown-menu li a").click(function () {
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    });
    options.indicator.top = options.ohlc.height + options.indicator.padding;
    options.indicator.bottom = options.indicator.top + options.indicator.height + options.indicator.padding;
    var indicatorTop = d3.scaleLinear().range([options.indicator.top, options.indicator.bottom]);
    var parseDate = d3.timeParse("%Y-%m-%d");

    var zoom = d3.zoom().on("zoom", zoomed);

    var x = techan.scale.financetime().range([0, options.plot.width]);

    var y = d3.scaleLinear().range([options.plot.height, 0]);

    var yInit, zoomableInit;

    var yVolume = d3.scaleLinear()
            .range([y(0), y(0.1)]);

    var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y);

    var volume = techan.plot.volume()
            .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
            .xScale(x)
            .yScale(yVolume);

    var xAxis = d3.axisBottom(x);
// btime annotations
    var timeAnnotation = techan.plot.axisannotation()
            .axis(xAxis)
            .orient('bottom')
            .format(d3.timeFormat("%H:%M %p"))
            .width(100)
            .translate([0, options.plot.height]);

    var yAxis = d3.axisRight(y);

    var ohlcAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .orient('right')
            .format(d3.format(',.2f'))
            .translate([x(1), 0]);

    var closeAnnotation = techan.plot.axisannotation()
            .axis(yAxis)
            .orient('right')
            .accessor(candlestick.accessor())
            .format(d3.format(',.2f'))
            .translate([x(1), 0]);

// changing the volume of candleSticks and zoom in/out
    var volumeAxis = d3.axisLeft(yVolume)
            .ticks(3)
//            .tickFormat(d3.format(",.3s"));

    var volumeAnnotation = techan.plot.axisannotation()
            .axis(volumeAxis)
            .orient("right")
            .width(35).translate([x(1), 0]);

    var ohlcCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(ohlcAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([ohlcAnnotation, volumeAnnotation])
            .verticalWireRange([0, options.plot.height]);

    var svg = d3.select(this.container).append("svg")
            .attr('id', "svg_id")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", "0 0 " + this.width + " " + this.height)
//            .attr("preserveAspectRatio", "xMidYMid meet")
//            .classed("svg-content-responsive", true);

    var defs = svg.append("defs");
    var aloo = defs.append("clipPath")
            .attr("id", "ohlcClip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", options.plot.width)
            .attr("height", options.plot.height);

    svg = svg.append("g")
            .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + options.plot.height + ")")
            .append("line")
            .call(xAxis.tickSize(-(options.plot.height)));

    var ohlcSelection = svg.append("g")
            .attr("class", "ohlc")
            .attr("transform", "translate(0,0)");

    ohlcSelection.append("g")
            .attr("class", "y_axis")
            .attr("transform", "translate(" + x(1) + ",0)")
            .call(yAxis.tickSize(-(options.plot.width)))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -12)
            .attr("dy", ".71em");

    ohlcSelection.append("g")
            .attr("class", "close annotation up");

    ohlcSelection.append("g")
            .attr("class", "volume")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#ohlcClip)");

    ohlcSelection.append("g")
            .attr("class", "volume axis");

    // Add trendlines and other interactions last to be above zoom pane
    svg.append('g')
            .attr("class", "crosshair ohlc").append("line").attr("x1", 0).attr("y1", 0)
            .attr("x2", options.plot.width + 10).attr("y2", 0).style("stroke", "white").style("stroke-width", "2px")
    svg.append('g')
            .attr("class", "crosshair ohlc").append("line").attr("x1", 0).attr("y1", 0)
            .attr("x2", options.plot.width + 20).attr("y2", 0).style("stroke", "black").style("opacity", 0.5);


    var parentArr = [];
//    d3.json(this.data, function (error, data) {
    d3.json("api.json", function (error, data) {
        if (error)
            return;
        var accessor = candlestick.accessor(),
                indicatorPreRoll = 1;                    // Don't show where indicators don't have data            
        console.log(data, "swag...");

        data.forEach(function (d) {
//                d.date= parseDate(d.date),
            d.date = new Date(d.date),
                    d.open = d.open,
                    d.high = d.high,
                    d.low = d.low,
                    d.close = d.close,
                    d.volume = d.volume
        });
        console.log(data, "swag...2");
        parentArr.push(data);       // pushing data to parent array 

// calculating domain for the dropdown selection        
        var dateNew = data[data.length - 1].date;   // finding last date in json data      
        console.log(dateNew, "dateNew");
        var yr = dateNew.getFullYear();  // year of last date
        console.log(yr, "yr");
        var mon = dateNew.getMonth();      // month of the last date
        console.log(mon, "mon");
        var noOfdays = new Date(yr, mon, 0).getDate();   // total no. of days of the last date
        console.log(noOfdays, "noOfdays");
        var ts = dateNew.getTime();  // timestamp of last date
        console.log(ts, "ts");    
        var day = dateNew.getDate(); // day of thee month
        console.log(day, "day");
        var hr = dateNew.getHours();  //finding hr
        console.log(hr, "hr");
        var min = dateNew.getMinutes()
        console.log(min, "min");


        var init_min = moment(dateNew).subtract(50, 'minutes');      
        console.log(init_min._d,  "date init_min");
        
        var init_5min = ts - (5 * 60000 * 50);
        console.log(init_5min, new Date(init_5min), "date init_5min");
        
        var init_15min = ts - (15 * 60000 * 50);
        console.log(init_15min, new Date(init_15min), "date init_15min");
        
        var init_30min = ts - (30 * 60000 * 50);
        console.log(init_30min, new Date(init_30min), "date init_30min");
        
        var init_hr = moment(dateNew).subtract(50, 'hours');
        console.log(init_hr._d, "date init_hr");  
        
        var init_day = moment(dateNew).subtract(50, 'days');
        console.log(init_day._d, "date init_day");
        
        var init_3day = ts - (3 * 24 * 60 * 60000 * 50);
        console.log(init_3day, new Date(init_3day), "date init_3day");
        
        var init_wk = moment(dateNew).subtract(50, 'weeks');
        console.log(init_wk._d, "date init_wk");
        
        var init_mon = moment(dateNew).subtract(50, 'months');
        console.log(init_mon._d, "init_mon");


//creating arrays to push the required data on changing of the dropdown
        var arr1 = [];
        arr1.push(data[0]);
        var arr2 = [];
        arr2.push(data[0]);
        var arr3 = [];
        arr3.push(data[0]);
        for (var k = 1; k <= data.length; k++) {
            if (data[k * 3]) {
                arr1.push(data[[k * 3]]);
            }
            if (data[k * 7]) {
                arr2.push(data[k * 7]);
            }
            if (data[k * noOfdays]) {
                arr3.push(data[k * noOfdays]);
            }
        }
// setting default domain on loading        
        onChangeButton(data);
        function settingNewDomain(bt) {
            switch (bt) {
                case "1 Min":
                    var dom = [dateNew, init_min._d];  
                    onChangeButton(arr1);  // onChangeButton(bt, dom); 
                    break;
                    case "5 Min":
                    var dom = [dateNew, new Date(init_5min)];
                    onChangeButton(arr1);    // onChangeButton(bt, dom);
                    break;
                case "15 Min":
                    var dom = [dateNew, new Date(init_15min)];
                    onChangeButton(arr2);     // onChangeButton(bt, dom);
                    break;
                case "30 Min":
                    var dom = [dateNew, new Date(init_30min)];   
                    onChangeButton(arr3);     // onChangeButton(bt, dom);
                    break;
                case "1 Hr":
                    var dom = [dateNew, init_hr._d];
                    onChangeButton(arr3);     // onChangeButton(bt, dom);
                    break;
                case "1 D":
                    var dom = [dateNew, init_day._d];
                    onChangeButton(arr3);     // onChangeButton(bt, dom);
                    break;
                case "3 D":
                    var dom = [dateNew, new Date(init_3day)];
                    onChangeButton(arr1);     // onChangeButton(bt, dom);
                    break;
                case "1 W":
                    var dom = [dateNew,  init_wk._d];
                    onChangeButton(arr2);     // onChangeButton(bt, dom);
                    break;
                case "1 MO":
                    var dom = [dateNew, init_mon._d];
                    onChangeButton(arr3);     // onChangeButton(bt, dom);
                    break;
                default:
                    var dom = [dateNew, new Date(init_30min)];
                    onChangeButton(data);     // onChangeButton(bt, dom);
            }
            draw();   // invoking draw()...
        }
        $('body').on('click', '.dropdown-menu li', function () {
            settingNewDomain($(this).text());
        });
        function onChangeButton(selArr) {      // function onChangeButton(bt, dom) {

//            $.ajax({
//                headers: {
//                    Accept: "application/json",
//                },
//                'type': 'GET',
//                'data': data,
//                'url': url,
//                success: function (response) {
//                    if (response.status == 200) {
//                        alert("successful ajax call...");
//                    }
//                   var res=[];
//                   for(var i=0; i <= response.length-1; i++) {
////                       console.log(data, "data");
//                         if(data[i].date > dom[0]){
//                             if(data[i].date < dom[1]){
//                                res.push(data[i]);
//                             }
//                         }
//                   }
                   
                

//                    x.domain(dom);
//                    svg.select("g.candlestick").datum(res).call(candlestick);
//                    svg.select("g.close.annotation").datum([res[res.length - 1]]).call(closeAnnotation);
//                    svg.select("g.volume").datum(res).call(volume);
//                    svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom).on("dblclick.zoom", null);
//                },
//                error: function (response) {
//                     alert("Ajax error ...");
//                }
//            });

            console.log(techan.scale.plot.time(selArr).domain(), "techan.scale.plot.time(selArr).domain()...");
            x.domain(techan.scale.plot.time(selArr).domain());                                                    
            svg.select("g.candlestick").datum(selArr).call(candlestick);
            svg.select("g.close.annotation").datum([selArr[selArr.length - 1]]).call(closeAnnotation);
            svg.select("g.volume").datum(selArr).call(volume);
            svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom).on("dblclick.zoom", null);
        }

        y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain()).nice();
        yVolume.domain(techan.scale.plot.volume(data).domain());
        // Stash for zooming
        zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy();             // Zoom in a little to hide indicator preroll
        yInit = y.copy();
        draw();             // invoking draw()...    

    });
    d3.select(".x.axis").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null).on("click", null);
    d3.selectAll(".y_axis").call(d3.drag().on("drag", dragged)).on("dblclick.zoom", null).on("zoom", null);
//    d3.select("svg").on("wheel", function(d){ console.log("wheeled") });

//      horizontal zoom behaviour on clickin of buttons 
    var zoomfactor = 0.2;
    d3.select("#zoomin").on("click", function () {
        zoomfactor = zoomfactor + 0.1;
        zoomlistener.scaleTo(d3.select("#candle"), zoomfactor);
    });
    d3.select("#zoomout").on("click", function () {
        if (zoomfactor >= 0.2) {
            zoomfactor = zoomfactor - 0.1
        } else {
            zoomfactor = 0.1;
        }
        zoomlistener.scaleTo(d3.select("#candle"), zoomfactor);
    });
    var zoomlistener = d3.zoom().on("zoom", zoomed);
    var zoomlistenerYaxis = d3.zoom().on("zoom", zoomY);
//   Invoking function on dragging of Y-axis
    var dArr = [];
    function dragged() {
//          $( ".y_axis" ).draggable({ cursor: "dragging" });
        var yNo = d3.event.y;
        dArr.push(yNo);
        if (dArr[dArr.length - 1] > dArr[dArr.length - 2]) {
            drag_Y_Down();
        } else {
            drag_Y_Up();
        }
        draw();
    }
//    functions to change the heights of candles on dragging of Y_axis    
    function drag_Y_Down() {
        if (zoomfactor >= 0.3) {
            zoomfactor = zoomfactor - 0.08
        } else {
            zoomfactor = 0.1;
        }
        zoomlistenerYaxis.scaleTo(d3.select("#candle"), zoomfactor);
        draw();
    }

    function drag_Y_Up() {
        zoomfactor = zoomfactor + 0.08;
        zoomlistenerYaxis.scaleTo(d3.select("#candle"), zoomfactor);
    }
    ;

    function zoomY() {
        y.domain(d3.event.transform.rescaleY(yInit).domain());
        draw();
    }
    ;

//  zoom functionality with rescaling wrt to zoom behaviour for the graph...............
    function zoomed() {
        var len = x.domain().length;
        var count = [];
        for (var l = 0; l <= parentArr[0].length - 1; l++) {
            if (x.domain()[0] == parentArr[0][l].date) {
                count.push(l);
            }
        }
        ;
        var highArr = [];
        var lowArr = [];
        var high, low;
        for (var m = count[count.length - 1]; m <= count[count.length - 1] + len - 1; m++) {
            highArr.push(parentArr[0][m].high);
            lowArr.push(parentArr[0][m].low);
        }
        ;
        x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
        if (highArr.length != 0 && lowArr.length != 0) {
//            y.domain(d3.event.transform.rescaleY(yInit).domain());
            y.domain([Math.min.apply(null, lowArr), Math.max.apply(null, highArr)]);
        }
        ;
        for (var n = count[count.length - 1]; n <= count[count.length - 1] + len - 1; n++) {
            highArr.pop(parentArr[0][n].high);
            lowArr.pop(parentArr[0][n].low);
        }
        ;
        for (var p = 0; p <= parentArr[0].length - 1; p++) {
            if (x.domain()[0] == parentArr[0][p].date) {
                count.pop(p);
            }
            ;
        }
        ;
        draw();
    }
    ;

// defining draw() function
    function draw() {
        svg.select("g.x.axis").call(xAxis);
        svg.select("g.ohlc .y_axis").call(yAxis);
        svg.select("g.volume.axis").call(volumeAxis);
// We know the data does not change, a simple refresh that does not perform data joins will suffice.
        svg.select("g.candlestick").call(candlestick.refresh);
        svg.select("g.close.annotation").call(closeAnnotation.refresh);
        svg.select("g.volume").call(volume.refresh);
    }


    svg.on("mousemove", function () {
        var mouse = d3.mouse(this);
        var l_date = new Date(Date.parse(x.invert(mouse[0])));
        var ohcl_date = l_date.toString();
        parentArr[0].forEach(function (d, i) {
//            console.log(d, "aaaaaaaaaaaaaa");
            if (d.date.toString() == ohcl_date) {
                $("#o_ohlc").html(" " + d.open);
                $("#h_ohlc").html(" " + d.high);
                $("#c_ohlc").html(" " + d.close);
                $("#l_ohlc").html(" " + d.low);
                $("#v_ohlc").html(" " + d.volume);
            }
        })
    });

    var aspect = this.width / this.height;
    var chart = d3.select("svg");
    d3.select(window).on("resize", function () {
        var targetWidth = window.innerWidth;
//                chart.node().getBoundingClientRect().width;
        if (targetWidth <= this.width) {
            chart.attr("width", targetWidth);
            chart.attr("height", targetWidth / aspect);
        } else {
            chart.attr("width", width);
            chart.attr("height", height);
        }
    });
} // end of loadCandleChart()




