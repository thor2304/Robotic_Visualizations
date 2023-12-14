# Robot
## Simulator
See this in [Simulator.md](Simulator.md)

## URCaps
URCaps is the Universal robots way to develop plugins for PolyScope (The controller software running on the teach pendant)
The following link showcases what URCaps can be used for.
[https://www.universal-robots.com/articles/ur/urplus-resources/urcap-basics/](https://www.universal-robots.com/articles/ur/urplus-resources/urcap-basics/)
(specifically the Toolbar example looks promising for visualization needs; ctrl+f: MyToolbar)

### Why we have chosen not to create a URCap
Deciding to make this tool as a URCap, ties it too much into becoming a tool for Universal robots, but the vision is to be independent.
Therefore we have chosen to go with a JS library that allows us to easily create interactive plots of our data.

## Remote control using tcp/ip sockets
The robot has several interfaces that allow control via sockets.
The following is a showcase of sending URScript commands to the robot via the primary interface:
https://roboylabs.wordpress.com/2019/03/19/trigger-digital-i-o-of-ursim-with-tcp-ip-socket/

The following page outlines the different interfaces available, and their limitations:
https://www.universal-robots.com/articles/ur/interface-communication/remote-control-via-tcpip/

The following page describes in depth the capabilities of the RTDE interface:
https://www.universal-robots.com/articles/ur/interface-communication/real-time-data-exchange-rtde-guide/

It might be worth checking out section 12 of the URScript manual for information about running the robot in interpreter mode.

SDU robotics driver
https://sdurobotics.gitlab.io/ur_rtde/

UR Official RTDE tool
https://github.com/UniversalRobots/RTDE_Python_Client_Library
https://roboylabs.wordpress.com/2019/03/19/trigger-digital-i-o-of-ursim-with-tcp-ip-socket/

(Not
https://www.universal-robots.com/articles/ur/interface-communication/overview-of-client-interfaces/
)

https://www.universal-robots.com/articles/ur/interface-communication/remote-control-via-tcpip/

## URScript
It looks a lot like Python, no typing, if, elif and more

It is pass by value in function arguments.
Functions, loops and if statements must end with and "end" clause. Similar to javas "{ }" URScript uses ": end" like Python,
but instead of only an unindentation there is also the word end (note that it is indeed also unindented,
such that it matches the indent level of controlling block)

### Manual
The following is a link to the URScript manual:
https://www.universal-robots.com/download/manuals-e-series/script/script-manual-e-series-sw-510/

__The manual has an error__
in chapter 13.1.2 of the [script manual](https://s3-eu-west-1.amazonaws.com/ur-support-site/115824/scriptManual_SW5.11.pdf) 
there is an error in the input to the example function, the function takes only 4 inputs, but the example shows 5.


### Keep in mind
- Scripts can be run from polyscope by using the script block, and pointing it to the script file
- When doing this, the script will be ran in a loop infinitely.
- The script is auto updated upon changes.


### How the robot sees positions
The robot can be moved to a pose, which consists of `p[x,y,z,ax,ay,az]` where `ax, ay, az` is the rotation of the TCP in something called axis-angle notation.
https://en.wikipedia.org/wiki/Axis–angle_representation.
`x,y,z` is the position of the TCP in the base frame.

## Exporting logs from the robot
https://www.universal-robots.com/articles/ur/robot-care-maintenance/how-to-export-support-files-from-your-robot/
The log can then be found in the downloaded folder in: robot_configuration -> files -> log_history

The [UR log viewer](https://www.universal-robots.com/articles/ur/robot-care-maintenance/ur-log-viewer-manual/)  can be used to view the entire archive as well.

An example of how these look after running our test script have been uploaded to the repository at:
https://github.com/thor2304/Robotic_Visualizations/blob/master/RTDE_Data/Logfile/HowToReadLogs.md

## Forward kinematics
Are used to translate the rotations of the joints to positions.
The article at 
https://global.discourse-cdn.com/business7/uploads/universal_robots/original/2X/d/d4588fd696b452e4b6566f4f44ada81d9f6e6fe6.pdf
Which mentions Denavit–Hartenberg parameters. These are used to describe the robot in a way that allows us to calculate the forward kinematics.
https://en.wikipedia.org/wiki/Denavit–Hartenberg_parameters
https://www.youtube.com/watch?v=rA9tm0gTln8

The parameters of the robot are available from UR at:
https://www.universal-robots.com/articles/ur/application-installation/dh-parameters-for-calculations-of-kinematics-and-dynamics/

Shout out to Ebbe in the forums for providing the foundation of the links above in the post:
https://forum.universal-robots.com/t/how-to-get-joint-coordinates-of-each-joint/14942/5

### Deriving DH parameters
DH parameters could be calculated automatically by running a script on any robot.
Aside from this, they could simply be provided by the manufacturer. For the case of UR, they are.
https://blog.robotiq.com/how-to-calculate-a-robots-forward-kinematics-in-5-easy-steps

#### Flightrecord provides them
In the flightrecord provided by UR, they are available in the file: `files/urcontrol/urcontrol.conf` under the key: `DH`.
A next step for the maintenance tool could be to parse this file, and use the DH parameters to calculate the forward kinematics. 
Without requiring the user to provide the DH parameters.

# The tool
## Plotly
The tool uses plotly to create the visualizations. 
Plotly is a cross-language tool. 
They have implemented the same library in six different languages. 
Be aware that when searching for plotly problems, many answers relate to Python rather than JS.
Although i have had success by looking at a Python answer and doing pretty much the same thing in JS. 
The APIs are very similar, as the Python implementation uses the JS library under the hood.

The plotly documentation can be found at
https://plotly.com/javascript/reference/scatter/
https://plotly.com/javascript/reference/layout
https://plotly.com/javascript/reference/#scatter-legend
https://plotly.com/javascript/reference/layout/xaxis/
https://plotly.com/javascript/plotlyjs-function-reference/

Plotly works primarily by configuring the plot through an object provided to the main plot function, 
which can be either Plotly.newPlot or Plotly.react.

### Animation
Plotly has a built-in animation feature, that allows us to animate the plots.
At first we provided the frames to this feature, but because i suspected it to be a performance problem, 
we changed over to providing the specific frame to Plotly.animate instead.

### 3D Line tracing
This will be applicable if we wish to draw the TCP path in the 3d visualization.
https://plotly.com/javascript/3d-line-plots/#3d-line-plot

We could even use the coloring of the line to show some interesting property.
Perhaps we could highlight on the line in color the point in time that is currently active?

### 3D sizing
The 3D plots have a sizing problem. When zooming the markers and lines will maintain a constant width, which makes it hard to work with.
Plotly 3D plots are not meant to draw objects, like we are using it for, but instead to plot data.

## CSS position sticky
- https://elad.medium.com/css-position-sticky-how-it-really-works-54cd01dc2d46
  - Explaining that sticky is only sticky within the parent element
- https://dev.to/robmarshall/how-to-fix-issues-with-css-position-sticky-not-working-4a18
  - Explaining that sticky and overflow does not play nice
- https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
  - Overflow: clip

## Code highlighting
See [Code_highlighting.md](Code_highlighting.md)

## Dynamic resizing
See [Dynamic_resizing.md](Dynamic_resizing.md)