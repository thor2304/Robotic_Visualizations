# About the project Robotic_Visualizations

This project is a tool for visualizing logs extracted from a running cobot application. 
This iteration is focused on proving the usefulness of such an application, by applying it to a specific use case.
The use case is a UR5e arm picking up a tile, based on coordinates received from an external application.

The tool is produced as part of a research project supervised by Miguel Campusano.

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
  - Describe the issue enough for me to replicate it or discuss it further
  - Consider whether this should be a question first before making it a bug
- Question
  - Use this label if there is something about the tool, the data, the hosting, data handling etc. which you are unsure about.
  - These can be addressed either in a meeting or simply through the issue itself.
  - Please close the issue, when a satisfcactory answer has been provided
- EDDE Oddity
  - This will be used as the label for issues that would be a bug, but which is initially attributed to the nature of the data gathered from EDDE
  - Issues here will be discussed with Emil for either clarification or resolution.
- New Feature and enhancement
  - These labels should be used for issues that request changes to the code.  

Whenever possible consider using the issue template at [ISSUE_TEMPLATE.md](ISSUE_TEMPLATE.md)


# Working with URScript

The script that we will use for testing is [real_script_for_robot_use.script](Robot_control/full_scripts/all_runs/real_script_for_robot_use.script).
My short guide on URScripts is [running_urscripts.md](running_urscripts.md)

When viewing URScript Visual Studio code has an extension by Ahern Guo 
[https://marketplace.visualstudio.com/items?itemName=ahern.urscript](https://marketplace.visualstudio.com/items?itemName=ahern.urscript)

The extension is also what provides the text formatting capabilities for the code visualization. 
Thanks goes to Ahern Guo for making this extension and the TextMate grammar associated with it.

## Side notes
- For the thoughts on choosing framework / Language see [Language_framework.md](Language_framework)


# Data
The data is hosted on Onedrive, due to its large size. It can be found on 
[This link](https://syddanskuni-my.sharepoint.com/:f:/r/personal/tjoer21_student_sdu_dk/Documents/Contextual%20debugging?csf=1&web=1&e=vKsxSt).

The code expects the data to be in the folder `<project_root>/Robot_control/EDDE_data/WITH_POWER`. 
Within this folder is to be placed the folders containing the data. By default, the tool reads the `control` folder, 
such that the full path that is attempted is: `<project_root>/Robot_control/EDDE_data/WITH_POWER/control/control-0.csv`.

The document [data.md](data.md), explains some more about the data and how it is modelled internally in the tool.


## Data news (Pre summer break 2023)
Some more information about data receiving was uncovered, which lead to the creation of the document [Data news](data_news.md)
