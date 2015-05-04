a3-adityas-burg-aburner
===============

## Team Members

1. Aditya Sankar adityas@uw.edu
2. Brian Burg burg@uw.edu
3. Alex Burner aburner@uw.edu

## Project: Patch Pipeline

Our visualization is an exploratory tool for analyzing data from bots running WebKit patch tests. The current dashboard for the tests is a large table of text. It provides accurate data, but it is difficult to read and doesn't provide insight into the form of the test process:

![Old dashboard](https://raw.githubusercontent.com/CSE512-15S/a3-adityas-burg-aburner/master/old-dash.png)

Our visualization is designed to graphically represent the testing process, showing the flow of patch test attempts as the come from the queue and are run by bots multiple times against system builds. The different outcomes (pass, fail, abort, and retry) are represented by arrows, which we label with percentages from the patch test data. This queue flow diagram can be used as a selection tool, to choose a subset of the test results data for displaying in D3 histograms and a details table below.

![Our dashboard](https://raw.githubusercontent.com/CSE512-15S/a3-adityas-burg-aburner/master/our-dash.png)

## Running Instructions

Access our visualization at http://cse512-15s.github.io/a3-adityas-burg-aburner/ or download this repository and run `python -m SimpleHTTPServer 9000` and access this from http://localhost:9000/.

To use the visualization:
1. Select a date range at the top of the page
2. Wait for test results data to load from API
3. Use the queue flow diagram to select a test outcome
4. View detailed breakdowns of the test outcomes in the histogram and table

If you put your work online, please also write a [one-line description and add a link to your final work](http://note.io/1n3u46s) so people can access it directly from the CSE512-15S page.

## Story Board

[Our storyboard PDF is here](https://github.com/CSE512-15S/a3-adityas-burg-aburner/raw/master/artboards.pdf)


### Changes between Storyboard and the Final Implementation

1. In our initial storyboard, we planned to display all queue data in the histograms and tables, and then selecting specific outcomes in the queue flow diagram would filter the data down to a subset. However, this amount of data became prohibitive to work with, and so now the visualization starts with no histogram or table data and the user must make a selection from the diagram to populate them.

2. At first we planned to include Author and Bug Description columns in the patch results details table. However these would require separate API calls, made on each patch result. We decided this would take too long to load, and so those columns are left out of our final product.


## Development Process
TODO:

Include:
- Breakdown of how the work was split among the group members.
- A commentary on the development process, including answers to the following questions:
  - Roughly how much time did you spend developing your application?
  - What aspects took the most time?
