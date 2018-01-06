function loadCandleChart(options){
    
    if (options) {
        this.datav= options.data ? options.data : [] ;
        this.container = options.container ? options.container : "body";
        this.height = options.height ? options.height : 400;
        this.width = options.width ? options.width : 800;  
        options.plot = {
        width: this.width - options.margin.left - options.margin.right,
        height: this.height - options.margin.top - options.margin.bottom,
        };
    }else{
        console.error('candleStick Chart Initialization Error : candleStick Chart Params Not Defined');
        return false;
    } ;
    // on click of dropdown 
   $(".dropdown-menu li a").click(function(){
   $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
   $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
   });
   
    options.indicator.top = options.ohlc.height+options.indicator.padding;
    options.indicator.bottom = options.indicator.top+options.indicator.height+options.indicator.padding;
    var indicatorTop = d3.scaleLinear().range([options.indicator.top, options.indicator.bottom]);          
    var parseDate = d3.timeParse("%Y-%m-%d");
    var zoom = d3.zoom().on("zoom", zoomed);           
    var x = techan.scale.financetime().range([0, options.plot.width]);          
    var y = d3.scaleLinear().range([options.plot.height, 0]);          
    var yInit,  zoomableInit;
    var yVolume = d3.scaleLinear()
            .range([y(0), y(0.4)]);
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
            .format(d3.timeFormat('%Y-%m-%d'))
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
    var volumeAxis = d3.axisRight(yVolume)
            .ticks(3)
            .tickFormat(d3.format(",.3s"));
    var volumeAnnotation = techan.plot.axisannotation()
            .axis(volumeAxis)
            .orient("right")
            .width(35).translate([x(1), 0]);
    var ohlcCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(ohlcAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([ohlcAnnotation])
            .verticalWireRange([0, options.plot.height]);
    var svg = d3.select(this.container).append("svg")
            .attr('id', "svg_id")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", "0 0 " + this.width + " " + this.height )
//            .attr("preserveAspectRatio", "xMidYMid meet")
//            .classed("svg-content-responsive", true);
    var defs = svg.append("defs");
    var aloo=defs.append("clipPath")
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
            .call(xAxis.tickSize(-(options.plot.height)));
    var ohlcSelection = svg.append("g")
            .attr("class", "ohlc")
            .attr("transform", "translate(0,0)");
    ohlcSelection.append("g")
            .attr("class", "y_axis")
            .attr("transform", "translate(" + x(1)+ ",0)")
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
    // Add trendlines and other interactions last to be above zoom pane
    svg.append('g').attr("class", "crosshair ohlc");            
    var parentArr=[];       
//    d3.json(this.data, function(error, data) {
//        if(error) return;
        var accessor = candlestick.accessor(),
            indicatorPreRoll = 01;                    // Don't show where indicators don't have data
        var data = this.datav.map(function(d) {
//            console.log(d, "d");
            return {
                date: parseDate(d.Date),
                open: +d.Open,
                high: +d.High,
                low: +d.Low,
                close: +d.Close,
                volume: +d.Volume
            };
        });    
        
    console.log(typeof data[0].date, typeof data[0].high, typeof data[0].open, typeof data[0].low, typeof data[0].low, typeof data[0].close, typeof data[0].volume, "helol9o data..."); 
    parentArr.push(data);       // pushing data to parent array 
//    console.log(parentArr, "parenrArr tatat");
// finding number of days in the last full month of the json data 
        var dateNew=data[data.length-1].date;       
        var yr=dateNew.getFullYear();
        var mo=dateNew.getMonth();
        var noOfdays=new Date(yr, mo, 0).getDate();
//creating arrays to push the required data on changing of the dropdown
console.log(data, "ka ")
        var arr1=[];
        arr1.push(data[0]);
        var arr2=[];
        arr2.push(data[0]);
        var arr3=[];
        arr3.push(data[0]);       
            for (var k = 1; k<= data.length; k++) {
                if (data[k * 3]) {
                    arr1.push(data[[k * 3]]);
                }
                if (data[k * 7]) {
                    arr2.push(data[k*7]);                  
                }
                if (data[k * noOfdays]) {
                    arr3.push(data[k*noOfdays]);                  
                }                        
            }                               
// setting default domain on loading        
        onChangeButton(data);           
//        var bt;
        function settingNewDomain(bt){
            switch(bt){
                case "3 D":
                      onChangeButton(arr1);
                    break;
                case "1 W":
                    onChangeButton(arr2);
                    break;
                case "1 MO":
                    onChangeButton(arr3);
                    break;
                default:
                    onChangeButton(data);
            }
            draw(); // invoking draw()...
        }   
        
        $('body').on('click', '.dropdown-menu li', function(){          
        settingNewDomain($(this).text());
        });     
    function onChangeButton(selArr){  
        console.log(selArr, "selArr...")
        x.domain(techan.scale.plot.time(selArr).domain());
        console.log(x.domain(), 'domain ooooo');
        svg.select("g.candlestick").datum(selArr).call(candlestick);
        svg.select("g.close.annotation").datum([selArr[selArr.length-1]]).call(closeAnnotation);
        svg.select("g.volume").datum(selArr).call(volume);
        svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom).on("dblclick.zoom", null);       
    }   
    
        console.log(data.slice(indicatorPreRoll), 'data.slice(indicatorPreRoll)');
        y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
        console.log(y.domain(), 'domain ooooo');
        yVolume.domain(techan.scale.plot.volume(data).domain());
        console.log(yVolume.domain(), 'domain vvvvooooo');
        // Stash for zooming
        zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy();             // Zoom in a little to hide indicator preroll
        yInit = y.copy();
        draw();             // invoking draw()...    
        
//    });
    d3.select(".x.axis").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null).on("click", null);
    d3.selectAll(".y_axis").call(d3.drag().on("drag", dragged)).on("dblclick.zoom", null).on("zoom", null);

   
//      horizontal zoom behaviour on clickin of buttons 
    var  zoomfactor=0.2;
    d3.select("#zoomin").on("click", function (){
        zoomfactor = zoomfactor + 0.1;
        zoomlistener.scaleTo(d3.select("#candle"), zoomfactor);
    });
    d3.select("#zoomout").on("click", function (){
        if(zoomfactor >= 0.2){    
        zoomfactor = zoomfactor - 0.1
        } else{   
        zoomfactor= 0.1;
        }
        zoomlistener.scaleTo(d3.select("#candle"), zoomfactor);   
    });
    var zoomlistener = d3.zoom().on("zoom", zoomed);
    var zoomlistenerYaxis = d3.zoom().on("zoom", zoomY);
//   Invoking function on dragging of Y-axis
      var dArr=[];
      function dragged(){
//          $( ".y_axis" ).draggable({ cursor: "dragging" });
          var yNo= d3.event.y;
          dArr.push( yNo );
          if(dArr[dArr.length-1] > dArr[dArr.length-2]){
              drag_Y_Down();
          }else{
              drag_Y_Up();
          }
      }                 
//    functions to change the heights of candles on dragging of Y_axis    
    function drag_Y_Down(){
        if(zoomfactor >= 0.3){     
          zoomfactor = zoomfactor - 0.08
          } else{   
          zoomfactor= 0.1;
          }
          zoomlistenerYaxis.scaleTo(d3.select("#candle"), zoomfactor);          
          draw();
    }  
    function drag_Y_Up(){ 
        zoomfactor = zoomfactor + 0.08;
        zoomlistenerYaxis.scaleTo(d3.select("#candle"), zoomfactor);
    }    
    function zoomY(){
        y.domain(d3.event.transform.rescaleY(yInit).domain());
        draw(); 
    };  
   function update(){
       svg.attr("transform"," scale(" + d3.event.scale + ")");
   }
   
   var limitArr=[];
//  zoom functionality with rescaling wrt to zoom behaviour for the graph...............
    function zoomed(){
//        console.log(d3.event ,"dooms dqya papapapapapap..." );
//            var limitArrIndex=[];
//            var newArr1=[];
        var domArr= x.domain();    
//        console.log(domArr ,"domArr..." );
        var length= x.domain().length;
//        console.log(length ,"lenth zoomed" );
        if(length<=20 && length>=7 ){               
            limitArr.push(x.domain());
//            console.log(limitArr, "limitArr.com $$$$$$$$$$$$$$$$");
            var newArr1= limitArr.slice(-1).pop();
//            console.log(newArr1, "newArr1.In ...");
            setDomainLimitOnZoom(newArr1);
        }else if(length<7){
            var newArr1= limitArr.slice(-1).pop();
//            console.log(newArr1, "newArr1 under 7@@@")
            setDomainLimitOnZoom(newArr1)
        }else{
            setDomainLimitOnZoom(domArr);
        } 
    }
    
      function setDomainLimitOnZoom(lenArr){
//          console.log( lenArr, " lenArr");
            var len= lenArr.length;
//            console.log(len, " inside setDomainLimit()");
//            console.log(limitArr.length, "limitArr.length ********************************************************************************************************************************");
            var count=[];
            for(var l=0; l<=parentArr[0].length-1; l++){              
               if(x.domain()[0] == parentArr[0][l].date){
                   count.push(l);                 
               }                                                   
            };
            var highArr=[];
                var lowArr=[];
                var high, low;
            for( var m=count[count.length]; m<= count[count.length]+len-1; m++){   
                highArr.push(parentArr[0][m].high);
                lowArr.push(parentArr[0][m].low);               
            }; 
            x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
            if(highArr.length!=0 && lowArr.length!=0){
//            y.domain(d3.event.transform.rescaleY(yInit).domain());
            y.domain([Math.min.apply(null,lowArr), Math.max.apply(null,highArr)]);         
            };
            for( var n=count[count.length]; n<= count[count.length]+len-1; n++){                                   
                highArr.pop(parentArr[0][n].high);
                lowArr.pop(parentArr[0][n].low);               
            };
            for(var p=0; p<=parentArr[0].length-1; p++){              
            if(x.domain()[0] == parentArr[0][p].date){
                   count.pop(p);                 
            }; 
        };
        draw();
//      }       
    };
// defining draw() function
    function draw(){
        console.log(" thrones of games...");
        svg.select("g.x.axis").call(xAxis);
        svg.select("g.ohlc .y_axis").call(yAxis);
// We know the data does not change, a simple refresh that does not perform data joins will suffice.
        svg.select("g.candlestick").call(candlestick.refresh);             
        svg.select("g.close.annotation").call(closeAnnotation.refresh);
        svg.select("g.volume").call(volume.refresh);
    }   
    
                var aspect = this.width / this.height;
                var chart = d3.select("svg");
                d3.select(window).on("resize", function() {
                var targetWidth = window.innerWidth;
//                chart.node().getBoundingClientRect().width;
                if(targetWidth <= this.width){
                                  chart.attr("width", targetWidth);
                                   chart.attr("height", targetWidth / aspect);
                               }else{
                                  chart.attr("width", width);
                                   chart.attr("height", height);
                               }                       
                }); 
}  // end of loadCandleChart()