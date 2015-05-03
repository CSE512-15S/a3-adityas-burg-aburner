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

WK.PipelineViewController = function() {
    WK.Object.call(this);

    // First, set up data sources.
    this._tracDataSource = new WK.TracDataSource("https://trac.webkit.org/");
    this._tracDataSource.addEventListener(WK.TracDataSource.Event.CommitsUpdated, this._commitDataUpdated, this);

    this.macQueueDiagramView = new WK.QueueDiagramView(WK.DummyData.macQueue);
    this.iosQueueDiagramView = new WK.QueueDiagramView(WK.DummyData.iosQueue);

    var pickerElement = this._pickerElement = document.createElement("span");
    pickerElement.id = "range-picker";
    pickerElement.size = 40;
    pickerElement.textContent = "Please select a date range";
    $(".date-selection").append(pickerElement);

    $("#range-picker")
    .dateRangePicker({
        startOfWeek: navigator.language === "en-us" ? "sunday" : "monday",
        endDate: new Date(),
        showShortcuts: false,
        getValue: function() { return this.textContent; },
        setValue: function(value) { this.textContent = value; }
    })
    .on('datepicker-apply', function(event, picker) {
        // This message is dispatched even when range hasn't been selected (or only one endpoint was),
        // in which case the actual range hasn't changed, and there is nothing to do.
        if (isNaN(picker.date1) || isNaN(picker.date2))
            return;

        var endDate = new Date(new Date(picker.date2).setDate(picker.date2.getDate() + 1));
        this._dateRangeChanged(picker.date1, endDate)
    }.bind(this));

    var $queueList = $('<ul class="queue-diagrams"></ul>');
    $queueList.append(this.macQueueDiagramView.$element);
    $queueList.append(this.iosQueueDiagramView.$element);
    $(".queue-container").append($queueList);

    var $histogramSection = $('<div class="histograms" />');
    // FIXME: insert the histogram building stuff here.
    $("#content").append($histogramSection);

    var $detailsSection = $('<div class="details" />');
    this.buildAttemptsTable = new WK.BuildAttemptTableView(WK.DummyData.buildAttempts);
    $detailsSection.append(this.buildAttemptsTable.$element);
    $("#content").append($detailsSection);
}

WK.PipelineViewController.prototype = {
    __proto__: WK.Object.prototype,
    constructor: WK.PipelineViewController,

    // Public

    setDateRange: function(startDate, endDate)
    {
        $(this._pickerElement).data('dateRangePicker').setDateRange(startDate, endDate);
        this._dateRangeChanged(startDate, endDate);
    },

    // Private

    _dateRangeChanged: function(startDate, endDate)
    {
        this._tracDataSource.fetchCommitsForDateRange(startDate, endDate);
        this._tracLoadingMessage = $('<li>Loading commit metadata...</li>');
        $("ul.status-messages").append(this._tracLoadingMessage);
        //var queues = unhiddenQueues().filter(function(queue) { return queue.builder || queue.tester; });
        //analyzer.analyze(queues, picker.date1, endDate);
    },

    _commitDataUpdated: function()
    {
        console.log("Fetched commits from trac: ", this._tracDataSource.recordedCommits);
        $(this._tracLoadingMessage).remove();
        delete this._tracLoadingMessage;
    }
};
