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

WK.QueueDiagramView.Event = {
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
        this.render();
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
                tryPath: false,
                abortPath: false,
                passPath: false,
                failPath: false
            };

            // need jQuery objects for event listeners
            var $circle = $attempt.find('.center-circle');
            var $tryPath = $attempt.find('.try-path');
            var $abortPath = $attempt.find('.abort-path');
            var $passPath = $attempt.find('.pass-path');
            var $failPath = $attempt.find('.fail-path');

            // need native svg elements for class manipulation (-__-)
            var circleEl = $circle.get(0);
            var tryPathEls = $tryPath.get();
            var abortPathEls = $abortPath.get();
            var passPathEls = $passPath.get();
            var failPathEls = $failPath.get();

            // check if try/abort/pass/fail selected
            function isAnyPathSelected() {
                return (isSelected.tryPath ||
                        isSelected.abortPath ||
                        isSelected.passPath ||
                        isSelected.failPath);
            }

            // decide whether center circle is selected
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
                isSelected.tryPath = true;
                isSelected.abortPath = true;
                isSelected.passPath = true;
                isSelected.failPath = true;
                changeClass(tryPathEls, 'add', 'selected');
                changeClass(abortPathEls, 'add', 'selected');
                changeClass(passPathEls, 'add', 'selected');
                changeClass(failPathEls, 'add', 'selected');
            }

            // unselect all paths
            function unselectAllPaths() {
                isSelected.tryPath = false;
                isSelected.abortPath = false;
                isSelected.passPath = false;
                isSelected.failPath = false;
                changeClass(tryPathEls, 'remove', 'selected');
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

            // toggle try path
            $tryPath.find('*').on('click', function (e) {
                e.stopPropagation();
                isSelected.tryPath = !isSelected.tryPath;
                changeClass(tryPathEls, 'toggle', 'selected');
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
    }
};
