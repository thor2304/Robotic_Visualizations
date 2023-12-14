# Language / Framework considerations
## Pros / cons of frameworks
### Plotly.js (This is my preference)

Benefits:
- Built on D3.js
- Great support for interactive plots, and zooming
- Lots of great scaffolding to build upon
- Labels on data is easy
- Seems to have good documentation
    - https://www.w3schools.com/js/js_graphics_plotly.asp
    - https://plotly.com/javascript/click-events/
        - Getting an event when clicking data in the plot
    - https://plotly.com/javascript/line-and-scatter/
        - Reference for line and scatter plots
    - https://plotly.com/javascript/reference/scatter/#scatter-customdata
        - Adding custom data to data points
    - https://plotly.com/javascript/subplots/#subplots-with-shared-axes
        - Sharing axis numbers

Drawbacks:
- Connecting the data to each point for interactivity, might have to be done in a creative fashion
    - Custom_data can be added to the points, so it might actually be incredibly easy
- If we reach a point where something cannot really be done. Then it cannot be done.
    - That is, if we reach something problematic, it will be very difficult to overcome it.

### P5.js
Benefits:
- I have prior experience working with p5.js and processing (a sister project)
    - Creating a game, quite interactive
- Is based on js, so can be shipped as a web page
    - Very portable
- Changing between views should be very easy
- The API is to me very nice

Drawbacks:
- Graph support is unknown, possibly non-existent
    - https://github.com/jagracar/grafica.js#main-features
- Some things will have to be made from scratch
  - Although these things will be quite easy due to the nice API
- Has been created to let creative people make visual projects
  - Not necessarily to make interactive visualizations of data

### Java Swing
Benefits:
- This is the language and framework used for PolyScope programming
- Although our visualizations will be written in a newer version of Java and Swing than is supported by PolyScope
  https://stackoverflow.com/questions/5481825/interactive-component-in-java-swing

Drawbacks:
- I don't have prior experience using Swing, but it seems to be easy to learn
- I don't know yet how easy it will be to change views and draw graphs when changing views
    - But I believe it should be easy

### PyQT
Benefits:
- There seems to be good support for graphs
- Is a python framework which is nice, albeit possibly slow

Drawbacks:
- Interactivity seems perhaps more difficult

### Smalltalk
Benefits:
- Visualizations have been made in this before
- Objects can be directly tied into the visualization using OOP principles

Drawbacks:
- The learning curve looks very steep
- The main benefits of using OOP can also be applied to the other options
