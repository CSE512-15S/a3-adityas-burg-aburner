/*
 * Copyright (C) 2015 University of Washington.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WK.OutcomeHistogramsView = function(delegate) {
    WK.Object.call(this);

    // NOTE: use this to obtain a WK.Patch object by its id:
    //     this._delegate.getPatchById(...);
    this._delegate = delegate;

    this.element = document.createElement("div");
    this.element.className = "output-histograms";

    this.queues = delegate.queues;

    this.render();
};

WK.OutcomeHistogramsView.prototype = {
    __proto__: WK.Object.prototype,
    constructor: WK.OutcomeHistogramsView,

    get queueMetrics()
    {
        return this._metrics;
    },

    set queueMetrics(value)
    {
        console.assert(value instanceof WK.PatchQueueMetrics, value);
        this._metrics = value;
        this.render();
    },

    render: function()
    {
        this.element.removeChildren();

        //if (!this.queueMetrics)
            //return;

        // Generate a Bates distribution of 10 random variables.
		var num_histograms = 3;

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        var margin = {top: 10, right: 30, bottom: 30, left: 30},
            width = 1000/num_histograms - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;
			
			//width/= num_histograms;
		

        // Construct the SVG elemnts.
		
		for(var i =0; i< num_histograms; i++)
		{
			var values = d3.range(1000).map(d3.random.bates(10));

	        var x = d3.scale.linear()
	            .domain([0, 1])
	            .range([0, width]);

	        // Generate a histogram using twenty uniformly-spaced bins.
	        var data = d3.layout.histogram()
	            .bins(x.ticks(20))
	            (values);

	        var y = d3.scale.linear()
	            .domain([0, d3.max(data, function(d) { return d.y; })])
	            .range([height, 0]);

	        var xAxis = d3.svg.axis()
	            .scale(x)
	            .orient("bottom")
				.ticks(5);
	
			var yAxis = d3.svg.axis()
	            .scale(y)
	            .orient("left")
				.ticks(5);
				
			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function(d) {
			    return "<strong>Count:</strong> <span style='color:red'>" + formatCount(d.y) + "</span>";
			  })
	
	        var svg = d3.select(this.element).append("svg")
	            .attr("width", width + margin.left + margin.right)
	            .attr("height", height + margin.top + margin.bottom)
	          .append("g")
	            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
	        var bar = svg.selectAll(".bar")
	            .data(data)
	          .enter().append("g")
	            .attr("class", "bar")
	            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
	
			svg.call(tip);

	        bar.append("rect")
	            .attr("x", 1)
	            .attr("width", x(data[0].dx) - 1)
	            .attr("height", function(d) { return height - y(d.y); })
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

				// 	        bar.append("text")
				// .attr("font-size","8px")
				// 	            .attr("dy", ".5em")
				// 	            .attr("y", 6)
				// 	            .attr("x", x(data[0].dx) / 2)
				// 	            .attr("text-anchor", "middle")
				// 	            .text(function(d) { if(formatCount(d.y)>0)
				// 						return formatCount(d.y); 
				// 					else
				// 						return "";
				// 						});

	        svg.append("g")
	            .attr("class", "x axis")
	            .attr("transform", "translate(0," + height + ")")
	            .call(xAxis);
	
				svg.selectAll(".tick")
				    .filter(function (d) { return d === 0;  })
				    .remove();

			svg.append("g")
	            .attr("class", "y axis")
	            .attr("transform", "translate("+0+",0)")
	            .call(yAxis);
	
		}
    }
};
