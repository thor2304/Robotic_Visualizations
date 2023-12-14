# The simulator
Using VmWare was a good solution oracle VMBox was flickering when renderign the robot.
[This fixes the resizing issue on Oracle VMBox.](https://forum.universal-robots.com/t/ursim-5-10-virtual-box-cannot-resize-virtual-screen/14399/2)

## On Linux
Miguel got it to run by:
- Removing the dependency on libcurl3 in the install.sh script
- Ensuring that java8 is installed on the pc.
    - There might have to be made some changes to the $HOME variable in the install.sh script


# Developing in the simulator
## Mocking inputs
Digital inputs can be triggered through the server on the robot:
https://roboylabs.wordpress.com/2019/03/19/trigger-digital-i-o-of-ursim-with-tcp-ip-socket/
Further ressources on the dashboard server is present on the RosDriver page linked above.

Universal robots documentation on the dashboard server (purely informational, hence dashboard):
https://www.universal-robots.com/articles/ur/dashboard-server-e-series-port-29999/

Actually it is not the dashboard server that is used for this, it is the "primary interface" that is on port 30001. As specified here:
https://www.universal-robots.com/articles/ur/interface-communication/remote-control-via-tcpip/

URScript is another name for the nodes that are drag and dropped in PolyScope. URScript commands can be sent over the primary interface. That is how we can mock IO using the primary interface.
[URScript manual](https://s3-eu-west-1.amazonaws.com/ur-support-site/115824/scriptManual_SW5.11.pdf)

It seems that there is no URScript command to set inputs (since that would not be a part of regular use). So back to the drawing board.

The 8 digital inputs can be manually controlled while in the simulation mode of PolyScope. (Which is also the most useful, since it does not require you to move the robot into starting position before starting the script.). This however is not as useful as being able to do full programmatic mocking.


https://underautomation.com/universal-robots/documentation/get-started-python
^^ This is the only ressource i can find, that seems to be able to write input values. It seems like UR is not a fan of writing input values.
The ROS driver is as well hinting at writing input values, but it is not equally as clear.

https://www.universal-robots.com/download/software-e-series/simulator-linux/offline-simulator-e-series-ur-sim-for-linux-594/
"Input IO state cannot be set"
Universal robots claim that it is not possible. At this point i believe them. I might have read wrong in the underautomation examples and it seems to actually be output values that they set.

### Mocking solution
It seems to me like the best way to go about it is to use the input registers if we want to transmit data to the UR in a way that can be mocked.

## URCaps
URCaps is the Universal robots way to develop plugins for PolyScope (The controller software runnign on the teach pendant)
https://www.universal-robots.com/articles/ur/urplus-resources/urcap-basics/
(specifically the Toolbar example looks promising for visualization needs; ctrl+f: MyToolbar)

These are developed in Java6, and may provide a way for us to visualize data back into PolyScope. Whether we can get access to the robot visualization itself is not known as of this time.

### URCap starter pack
https://www.universal-robots.com/articles/ur/urplus-resources/urcap-download-center/
The starter pack contains, icons and SDKs needed to develop a URCap.

Pick up here:
https://www.universal-robots.com/articles/ur/urplus-resources/urcap-my-first-urcap/

URCap tutorial:
https://www.universal-robots.com/media/1819318/urcap_tutorial_html.pdf
The example: "Coordinate Map" might be useful. It shows how to get click information from a user clicking on an image.

I prefer the swing tutorial for the URCaps:
https://www.universal-robots.com/media/1819317/urcap_tutorial_swing.pdf
In this there is a "My Toolbar" example, which looks good.



## Capabilities
The robot can be controlled in 3 major different ways:
- Through the teach pendant
- Through URScript programs
- Through the RTDE Socket connection

And the robot can receive input data in 3 overall major ways:
- Through physical inputs
    - Digital inputs
    - Analog inputs
- Through Input registers
    - 24 integers
    - 24 doubles
    - 64 bit
    - All can be used at the same time
    - Controlled through i.e. the [RTDE socket](https://www.universal-robots.com/articles/ur/interface-communication/real-time-data-exchange-rtde-guide/)
- Through MODBUS
    - Which also runs on a socket connection

The input registers and MODBUS can be used from the simulator as well, which means they can be mocked and fully work from the desk. The physical inputs have no way of being controlled through the simulator.

The teach pendant has a block based UI, which is laid on top of URScript. Through the RTDE socket connection, it is possible to send move commands (and other URScript commands) to the robot, and therefore control it without a URScript program present. Effectively it allows you to execute the script remotely, and in another language, and then only send the physical commands in URScript.
