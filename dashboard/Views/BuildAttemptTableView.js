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

WK.BuildAttemptTableView = function(attempts) {
    WK.Object.call(this);

    this._attempts = attempts;

    // FIXME: we should probably sort these attempts, unless done elsewhere.

    var columns = [
        {key: "try", label: "Try"},
        {key: "result", label: "Result"},
        {key: "patch", label: "Patch"},
        {key: "start", label: "Start"},
        {key: "duration", label: "Duration"},
        {key: "author", label: "Author"},
        {key: "description", label: "Bug description"},
    ];

    // FIXME: split into separate render() function.
    var lines = [];
    lines.push('<table class="build-attempts">');
    lines.push('<thead><tr>');
    columns.forEach(function(column) { lines.push('<th>' + column.label + '</th>') });
    lines.push('</tr></thead><tbody>')
    this._attempts.forEach(function(attempt) {
        lines.push(WK.ViewTemplates.buildAttemptTableRow(attempt));
    });
    lines.push('</tbody></table>');
    this.$element = $(lines.join(''));
}

WK.BuildAttemptTableView.prototype = {
    __proto__: WK.Object.prototype,
    constructor: WK.BuildAttemptTableView,

    get attempts()
    {
        return this._attempts.slice();
    }
};
