# Robotic_Visualizations

For the thoughts on choosing framework / Language see [Language_framework.md](Language_framework)

The script that we will use for testing is [real_script_for_robot_use.script](Robot_control/full_scripts/all_runs/real_script_for_robot_use.script).
My short guide on URScripts is [running_urscripts.md](running_urscripts.md)

When viewing URScript Visual Studio code has an extension by Ahern Guo 
[https://marketplace.visualstudio.com/items?itemName=ahern.urscript](https://marketplace.visualstudio.com/items?itemName=ahern.urscript)

The extension is also what provides the text formatting capabilities for the code visualization. 
Thanks goes to Ahern Guo for making this extension and the TextMate grammar associated with it.

## Data
The data is hosted on Onedrive, due to its large size. It can be found on 
[This link](https://syddanskuni-my.sharepoint.com/:f:/r/personal/tjoer21_student_sdu_dk/Documents/Contextual%20debugging?csf=1&web=1&e=vKsxSt).

The code expects the data to be in the folder `<project_root>/Robot_control/EDDE_data/WITH_POWER`. 
Within this folder is to be placed the folders containing the data. By default, the tool reads the `control` folder, 
such that the full path that is attempted is: `<project_root>/Robot_control/EDDE_data/WITH_POWER/control/control-0.csv`.

The document [data.md](data.md), explains some more about the data and how it is modelled internally in the tool.



## Data news
Some more information about data receiving was uncovered, which lead to the creation of the document [Data news](data_news.md)