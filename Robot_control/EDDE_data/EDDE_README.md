## How to run

Input the IP Address of the robot as argument.

```bash
@root> python3 edde.py 192.168.1.10
```
See the screenshot for reference.

## Overview of input commands
```
Definition: COMMAND <SETTING> OPTION
Commands must be no longer than 1024 bytes.

get help          | returns an overview of possible commands.
get format        | returns the current data format as csv.
set X;Y;..;Z      | sets the current data format to be as indicated.
                  | set robot_power;target_acceleration;target_position
stream N X;Y;..;Z | starts a stream that stops when N events have been transmitted.
                  | stream 10 robot_power;target_acceleration.
stream X;Y;..;Z   | starts a continuous stream.
                  | stream robot_power.
stream            | starts a stream with outset in the current data format.
... store         | denoting "store" followed by any option pipes data to a file, 
                  | e.g., "store stream robot_epoch;current_line".
```       

## Overview of data points
|Data input request|Returned header format|
|------------------|----------------------|
robot_epoch|robot_epoch|
protective_stop|protective_stop|
execution_time|execution_time|
current_thread|current_thread|
current_memory_process|current_memory_process|
current_memory_total|current_memory_total|
current_cpu_usage|current_cpu_usage|
previous_line|previous_line|
current_line|"current_line,current_line_str|
blend|blend|
target_acceleration|target_acceleration_0,target_acceleration_1,target_acceleration_2,target_acceleration_3,target_acceleration_4,target_acceleration_5|
target_position|target_position_0,target_position_1,target_position_2,target_position_3,target_position_4,target_position_5|
actual_position|actual_position_0,actual_position_1,actual_position_2,actual_position_3,actual_position_4,actual_position_5|
target_torque|target_torque_0,target_torque_1,target_torque_2,target_torque_3,target_torque_4,target_torque_5|
actual_velocity|actual_velocity_0,actual_velocity_1,actual_velocity_2,actual_velocity_3,actual_velocity_4,actual_velocity_5|
target_velocity|target_velocity_0,target_velocity_1,target_velocity_2,target_velocity_3,target_velocity_4,target_velocity_5|
motor_temperatures|motor_temp_0,motor_temp_1,motor_temp_2,motor_temp_3,motor_temp_4,motor_temp_5|
torque_window_max|torque_window_max_0,torque_window_max_1,torque_window_max_2,torque_window_max_3,torque_window_max_4,torque_window_max_5
torque_window_min|torque_window_min_0,torque_window_min_1,torque_window_min_2,torque_window_min_3,torque_window_min_4,torque_window_min_5|
external_torque|external_torque_0,external_torque_1,external_torque_2,external_torque_3,external_torque_4,external_torque_5|
next_waypoint|joint_0_nwp,joint_1_nwp,joint_2_nwp,joint_3_nwp,joint_4_nwp,joint_5_nwp|
center_of_gravity|center_of_gravity_x,center_of_gravity_y,center_of_gravity_z|
intertia_x|intertia_x_0,intertia_x_1,intertia_x_2|
intertia_y|intertia_y_0,intertia_y_1,intertia_y_2|
intertia_z|intertia_z_0,intertia_z_1,intertia_z_2|
mass|mass|
instantanious_wear|instantanious_wear_0,instantanious_wear_1,instantanious_wear_2,instantanious_wear_3,instantanious_wear_4,instantanious_wear_5|
singularity_ratio|singularity_ratio|
accelerometer_reading|accelerometer_x,accelerometer_y,accelerometer_z
forces|force_x,force_y,force_z|
torques|torque_x,torque_y,torque_z|
target_pose|target_pose_0,target_pose_1,target_pose_2,target_pose_3,target_pose_4,target_pose_5|
actual_pose|actual_pose_0,actual_pose_1,actual_pose_2,actual_pose_3,actual_pose_4,actual_pose_5|
speed|actual_speed_0,actual_speed_1,actual_speed_2,actual_speed_3,actual_speed_4,actual_speed_5,target_speed_0,target_speed_1,target_speed_2,target_speed_3,target_speed_4,target_speed_5|
tool_ai|tai0, ..., tai[nToolAnalogInput]|
tool_di|tdi0, ..., tdi[nToolDigitalInput]|
tool_do|tdo0, ..., tdo[nToolDigitalOutput]|
tool_power|tool_power|
digital_i|digital_in_0, ..., digital_in_[nStandardDigitalInput]|
analog_i|analog_in_0, ..., analog_in_[nStandardAnalogInput]|
configurable_i|config_in_0, ..., config_in_[nConfigurableInput]|
digital_o|digital_out_0, ..., digital_out_[nStandardDigitalOutput]|
analog_o|analog_out_0, ..., analog_out_[nStandardAnalogOutput]|
configurable_o|config_out_0, ..., config_out_[nConfigurableOutput]|
variables|[variable];[value], ... N variables|
robot_power|robot_power,joint_voltage_0,joint_voltage_1,joint_voltage_2,joint_voltage_3,joint_voltage_4,joint_voltage_5,current_window_max_0,current_window_max_1,current_window_max_2,current_window_max_3,current_window_max_4,current_window_max_5,current_window_min_0,current_window_min_1,current_window_min_2,current_window_min_3,current_window_min_4,current_window_min_5,target_current_0,target_current_1,target_current_2,target_current_3,target_current_4,target_current_5,actual_current_0,actual_current_1,actual_current_2,actual_current_3,actual_current_4,actual_current_5|
