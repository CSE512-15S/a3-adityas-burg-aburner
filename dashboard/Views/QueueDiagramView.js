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

WK.QueueDiagramView = function(queue) {
    WK.Object.call(this);

    console.assert(queue instanceof WK.PatchQueue, queue);
    this.queue = queue;

    this.element = document.createElement("li");
    this.element.className = "queue";

    this.queueMetrics = new WK.PatchQueueMetrics(queue, {'attempts': []}); // Start with nothing.
}

WK.Object.addConstructorFunctions(WK.QueueDiagramView);

WK.QueueDiagramView.Event = {
    SelectionCleared: "selection-cleared",
    SelectionChanged: "selection-changed"
};

WK.QueueDiagramView.prototype = {
    __proto__: WK.Object.prototype,
    constructor: WK.QueueDiagramView,

    get name()
    {
        return this.queue.shortName;
    },

    get queueMetrics()
    {
        return this._metrics;
    },

    set queueMetrics(value)
    {
        console.assert(value instanceof WK.PatchQueueMetrics, value);
        this._metrics = value;
        this.renderShorter();
    },

    clearSelection: function()
    {
        this._selectedAttemptCount = null;
        this._selectedOutcome = null

        // TODO: change classes.
        this.dispatchEventToListeners(WK.QueueDiagramView.Event.SelectionCleared);
    },

    setSelection: function(ordinal, outcome)
    {
        console.assert(ordinal >= 0);

        ordinal = Math.min(ordinal, 3);
        outcome = outcome || null;

        // Re-selecting with cmd+click should clear.
        if (ordinal === this._selectedAttemptCount && outcome === this._selectedOutcome) {
            if (event.metaKey)
                this.clearSelection();
            return;
        }

        this._selectedAttemptCount = ordinal;
        this._selectedOutcome = outcome;

        // TODO: change classes.

        this.dispatchEventToListeners(WK.QueueDiagramView.Event.SelectionChanged);
    },

    get selectedOutcome()
    {
        return this._selectedOutcome;
    },

    get selectedAttemptCount()
    {
        return this._selectedAttemptCount;
    },

    renderShorter: function()
    {
        function elementClicked(event) {
            var target = event.target;
            console.log("click event", event);
            if (this._startElement === target.enclosingNodeOrSelfWithClass("queue-start")) {
                console.log("clicked inside start", this._startElement);
                this.clearSelection();
                return;
            }
            var enclosingSegment = target.enclosingNodeOrSelfWithClass("queue-attempt");
            if (!enclosingSegment)
                return;

            var ordinal = this._attemptElements.indexOf(enclosingSegment);
            if (ordinal === -1)
                return;

            console.log("clicked inside attempt", enclosingSegment);

            var enclosingCircle = target.enclosingNodeOrSelfWithClass("attempt-circle");
            if (enclosingCircle) {
                this.setSelection(ordinal);
                return;
            }

            var enclosingArrowOrLabel = target.enclosingNodeOrSelfWithClass("outcome");
            if (!enclosingArrowOrLabel)
                return;

            var outcome = null;
            if (enclosingArrowOrLabel.classList.contains("pass"))
                outcome = WK.PatchAttempt.Outcome.Pass;
            else if (enclosingArrowOrLabel.classList.contains("fail"))
                outcome = WK.PatchAttempt.Outcome.Fail;
            else if (enclosingArrowOrLabel.classList.contains("abort"))
                outcome = WK.PatchAttempt.Outcome.Abort;
            else if (enclosingArrowOrLabel.classList.contains("attempt"))
                outcome = WK.PatchAttempt.Outcome.Retry;

            if (!outcome)
                return;
            this.setSelection(ordinal, outcome);
        }

        this.element.removeChildren();

        this._startElement = $(WK.ViewTemplates.queueDiagramStart(this)).get(0);
        this._startElement.addEventListener("click", elementClicked.bind(this));
        this.element.appendChild(this._startElement);

        this._attemptElements = [];
        _.each(this.queueMetrics.attempts, function(attempt, index) {
            var attemptElement = $(WK.ViewTemplates.queueDiagramAttempt(attempt)).get(0);
            attemptElement.addEventListener("click", elementClicked.bind(this));
            this._attemptElements.push(attemptElement);
            this.element.appendChild(attemptElement);
        }, this);
    },

    render: function()
    {
        this.element.removeChildren();
        this.element.appendChild($(WK.ViewTemplates.queueDiagramStart(this)).get(0));
        this.queueMetrics.attempts.forEach(function (attempt, index) {
            var self = this;

            var $attempt = $(WK.ViewTemplates.queueDiagramAttempt(attempt));
            this.element.appendChild($attempt.get(0));

            //
            // handle attempt element selections
            //

            // track selection states
            var isSelected = {
                circle: false,
                attemptPath: false,
                abortPath: false,
                passPath: false,
                failPath: false
            };

            // need jQuery objects for event listeners
            var $circle = $attempt.find('.attempt-circle');
            var $attemptPath = $attempt.find('.attempt-path');
            var $abortPath = $attempt.find('.abort-path');
            var $passPath = $attempt.find('.pass-path');
            var $failPath = $attempt.find('.fail-path');

            // need native svg elements for class manipulation (-__-)
            var circleEl = $circle.get(0);
            var attemptPathEls = $attemptPath.get();
            var abortPathEls = $abortPath.get();
            var passPathEls = $passPath.get();
            var failPathEls = $failPath.get();

            // check if attempt/abort/pass/fail selected
            function isAnyPathSelected() {
                return (isSelected.attemptPath ||
                        isSelected.abortPath ||
                        isSelected.passPath ||
                        isSelected.failPath);
            }

            // decide whether attempt circle is selected
            function updateCircleSelect() {
                if (isAnyPathSelected()) {
                    isSelected.circle = true;
                    lunar.addClass(circleEl, 'selected');
                } else {
                    isSelected.circle = false;
                    lunar.removeClass(circleEl, 'selected');
                }
            }

            // change a class on an array of svgs
            function changeClass(svgEls, action, className) {
                var method = action + 'Class';
                svgEls.forEach(function (svgEl) {
                    lunar[method](svgEl, className);
                });
            }

            // select all paths
            function selectAllPaths() {
                isSelected.attemptPath = true;
                isSelected.abortPath = true;
                isSelected.passPath = true;
                isSelected.failPath = true;
                changeClass(attemptPathEls, 'add', 'selected');
                changeClass(abortPathEls, 'add', 'selected');
                changeClass(passPathEls, 'add', 'selected');
                changeClass(failPathEls, 'add', 'selected');
            }

            // unselect all paths
            function unselectAllPaths() {
                isSelected.attemptPath = false;
                isSelected.abortPath = false;
                isSelected.passPath = false;
                isSelected.failPath = false;
                changeClass(attemptPathEls, 'remove', 'selected');
                changeClass(abortPathEls, 'remove', 'selected');
                changeClass(passPathEls, 'remove', 'selected');
                changeClass(failPathEls, 'remove', 'selected');
            }

            // dispatch state change event
            function dispatchSelectEvent() {
                self.dispatchEventToListeners(
                    WK.QueueDiagramView.Event.SelectionChanged,
                    {
                        attempt: attempt,
                        isSelected: isSelected
                    }
                );
            }

            // toggle attempt path
            $attemptPath.find('*').on('click', function (e) {
                e.stopPropagation();
                isSelected.attemptPath = !isSelected.attemptPath;
                changeClass(attemptPathEls, 'toggle', 'selected');
                updateCircleSelect();
                dispatchSelectEvent();
            });

            // toggle abort path
            $abortPath.find('*').on('click', function (e) {
                e.stopPropagation();
                isSelected.abortPath = !isSelected.abortPath;
                changeClass(abortPathEls, 'toggle', 'selected');
                updateCircleSelect();
                dispatchSelectEvent();
            });

            // toggle pass path
            $passPath.find('*').on('click', function (e) {
                e.stopPropagation();
                isSelected.passPath = !isSelected.passPath;
                changeClass(passPathEls, 'toggle', 'selected');
                updateCircleSelect();
                dispatchSelectEvent();
            });

            // toggle fail path
            $failPath.find('*').on('click', function (e) {
                e.stopPropagation();
                isSelected.failPath = !isSelected.failPath;
                changeClass(failPathEls, 'toggle', 'selected');
                updateCircleSelect();
                dispatchSelectEvent();
            });

            // toggle all paths
            $circle.find('*').on('click', function (e) {
                e.stopPropagation();
                if (isSelected.circle) {
                    unselectAllPaths();
                    isSelected.circle = false;
                    lunar.removeClass(circleEl, 'selected');
                } else {
                    selectAllPaths();
                    isSelected.circle = true;
                    lunar.addClass(circleEl, 'selected');
                }
                dispatchSelectEvent();
            });

        }, this);
    },

    // Private

};
