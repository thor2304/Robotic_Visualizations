# Robot
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

## URScript manual
The following is a link to the URScript manual:
https://www.universal-robots.com/download/manuals-e-series/script/script-manual-e-series-sw-510/

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

## CSS position sticky
- https://elad.medium.com/css-position-sticky-how-it-really-works-54cd01dc2d46
  - Explaining that sticky is only sticky within the parent element
- https://dev.to/robmarshall/how-to-fix-issues-with-css-position-sticky-not-working-4a18
  - Explaining that sticky and overflow does not play nice
- https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
  - Overflow: clip

