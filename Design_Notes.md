This document will start out with no structure, and a prayer that some structure will emerge down the line...

# 3D axis colors
The axis are red, blue, and green, because they follow the same color scheme as URSim/Polyscope.
The colors are defined in `layoutFactory.js`.

# Static plots for reordering
At one point i attempted to make the plots static using Plotlys static plot option:
https://plotly.com/javascript/configuration-options/#making-a-static-chart
This seemed to work well for the 2D plots, but not for the 3D plots.
The current solution works well for 3D plots, but not very well for 2D plots.
It might be beneficial to look at incorporating the static plot option again, but only for the 2D plots.