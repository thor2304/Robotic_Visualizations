# About the project Robotic_Visualizations

This project is a tool for visualizing logs extracted from a running cobot application. 
This iteration is focused on proving the usefulness of such an application, by applying it to a specific use case.
The use case is a UR5e arm picking up a tile, based on coordinates received from an external application.

The tool is produced as part of a research project supervised by Miguel Campusano. 
It would not have been possible without Emil Stubbe Kolvig Raun.

## Live demo
A live demo is currently hosted at 
### [robotics.cryptobot.dk](robotics.cryptobot.dk)
This demo is password protected

# Using Github Issues
Feedback is very welcome by creating an Issue.
The different issue labels can be used by us to communicate the nature of the issue. 

Here is a short clarification of how the labels are expected to be used, such that they can also serve to document the project:

- Bug
  - If you discover something either while using the tool at the live demo, or by reading the source code, feel free to open a bug report on the issue.
  - Describe the issue enough for it to be replicated or discussed further
  - Consider whether this should be a question first before making it a bug
- Question
  - Use this label if there is something about the tool, the data, the hosting, data handling etc. which you are unsure about.
  - These can be addressed either in a meeting or simply through the issue itself.
  - Please close the issue, when a satisfactory answer has been provided
- New Feature and enhancement
  - These labels should be used for issues that request changes to the code.  

Whenever possible consider using the issue template at [ISSUE_TEMPLATE.md](ISSUE_TEMPLATE.md). 
Creating a new issue on GitHub should automatically use this template.


# Provided ressources
Many more ressources for this project have been compiled in [Ressources.md](Ressources.md).


## Working with URScript

The script that we will use for testing is [real_script_for_robot_use.script](Robot_control/full_scripts/all_runs/real_script_for_robot_use.script).
My short guide on URScripts is [running_urscripts.md](running_urscripts.md)

When viewing URScript Visual Studio code has an extension by Ahern Guo 
[https://marketplace.visualstudio.com/items?itemName=ahern.urscript](https://marketplace.visualstudio.com/items?itemName=ahern.urscript)

The extension is also what provides the text formatting capabilities for the code visualization. 
Thanks goes to Ahern Guo for making this extension and the TextMate grammar associated with it.

## Language / Framework
- For the thoughts on choosing framework / Language see [Language_framework.md](Language_framework)

# Code structure
The tool has been split into two parts. One for Contextual debugging and one for maintenance visualizations.
These have ended up being very similar and I think it would be beneficial to merge them back together.
The different features might then just be toggled on and off.
The primary difference is that the maintenance tool has an algorithm for calculating the stress of the robot, 
and is focused on reading data from the flight records. 
It needs the movement speed, which is not something that is included in the contextual debugging tool.

I have done some cleanup for better readability, but that was focused entirely on the contextual debugging part.


# Data
The public data is available on Zenodo through [This link](https://zenodo.org/records/10277257).

The code expects the data to be in the folder `<project_root>/Robot_control/EDDE_data/WITH_POWER`. 
Within this folder is to be placed the folders containing the data. By default, the tool reads the `2_4_partial` folder, 
such that the full path that is attempted is: `<project_root>/Robot_control/EDDE_data/WITH_POWER/2_4_partial/2_4_partial-0.csv`.

The tool also supports loading of data through the tool itself, by clicking "upload files".
On this page longer runs can be uploaded, and the tool will combine the data into a single file internally.

The document [data.md](data.md), explains some more about the data and how it is modelled internally in the tool.
