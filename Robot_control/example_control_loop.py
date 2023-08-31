#!/usr/bin/env python
# Copyright (c) 2016-2022, Universal Robots A/S,
# All rights reserved.
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#    * Redistributions of source code must retain the above copyright
#      notice, this list of conditions and the following disclaimer.
#    * Redistributions in binary form must reproduce the above copyright
#      notice, this list of conditions and the following disclaimer in the
#      documentation and/or other materials provided with the distribution.
#    * Neither the name of the Universal Robots A/S nor the names of its
#      contributors may be used to endorse or promote products derived
#      from this software without specific prior written permission.
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL UNIVERSAL ROBOTS A/S BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
import math
import sys

sys.path.append("..")
import logging

import rtde.rtde as rtde
import rtde.rtde_config as rtde_config

# logging.basicConfig(level=logging.INFO)

ROBOT_HOST = "192.168.1.10"
ROBOT_PORT = 30004
config_filename = "control_loop_configuration.xml"

ROBOT_OFFSET_ANGLE = - (math.pi / 4)

logging.getLogger().setLevel(logging.INFO)

conf = rtde_config.ConfigFile(config_filename)
state_names, state_types = conf.get_recipe("state")
setp_names, setp_types = conf.get_recipe("setp")
watchdog_names, watchdog_types = conf.get_recipe("watchdog")

index = 0


def convert_to_robot_space(x_coord, y_coord):
    x_out = x_coord * math.cos(ROBOT_OFFSET_ANGLE) - y_coord * math.sin(ROBOT_OFFSET_ANGLE)
    y_out = x_coord * math.sin(ROBOT_OFFSET_ANGLE) + y_coord * math.cos(ROBOT_OFFSET_ANGLE)
    return x_out, y_out


def main():
    con = rtde.RTDE(ROBOT_HOST, ROBOT_PORT)
    con.connect()
    print("connected")

    # get controller version
    con.get_controller_version()

    # setup recipes
    con.send_output_setup(state_names, state_types)
    setup = con.send_input_setup(setp_names, setp_types)
    watchdog = con.send_input_setup(watchdog_names, watchdog_types)

    # The function "rtde_set_watchdog" in the "rtde_control_loop.urp" creates a 1 Hz watchdog
    watchdog.input_int_register_0 = 0

    # start data synchronization
    if not con.send_start():
        sys.exit()

    state = con.receive()
    last_ready_value = state.output_bit_register_64
    keep_running = True
    pulse = state.output_bit_register_66

    setup.input_bit_register_65 = state.output_bit_register_65

    last_loop_start = 0

    # control loop
    while keep_running:
        # receive the current state
        state = con.receive()

        if state is None:
            break

        # if setup.input_double_register_24 != previous_input_24:
        #     print(f"input 24: {setup.input_double_register_24}")
        #     previous_input_24 = setup.input_double_register_24
        #
        # new_input_24 = float(input("new register value: "))
        # setup.input_double_register_24 = new_input_24
        # con.send(setup)

        wait_pulse_seen = (pulse != state.output_bit_register_66)
        if wait_pulse_seen:
            print(f"Pulse: {state.output_bit_register_66}")
            pulse = state.output_bit_register_66

        robot_ready, last_ready_value = robot_requests_coordinates(state, last_ready_value)
        if not robot_ready and not wait_pulse_seen:
            continue

        # The robot is now requesting coordinates,
        # and since we communicate readiness by flipping the flag,
        # we do not have to reset it
        print(f"r_r: {robot_ready} wai_pulse: {wait_pulse_seen} l_r:{last_ready_value}")
        # Generate the coordinates
        x_coord, y_coord = generate_coordinate()
        if index >= 1 + (5 * 1) + last_loop_start:
            if input("To start another loop, press enter, otherwise type anything, then enter:") == "":
                last_loop_start = index - 1
            else:
                x_in = input(f"new x_coordinate (Default {x_coord}: ")
                x_coord = float(x_in) if x_in != "" else x_coord
                y_in = input(f"new y_coordinate (Default {y_coord}: ")
                y_coord = float(y_in) if y_in != "" else y_coord

        x_coord, y_coord = convert_to_robot_space(x_coord, y_coord)

        set_coordinate_registers(con, setup, x_coord, y_coord)

        # kick watchdog
        con.send(watchdog)

    con.send_pause()

    con.disconnect()


def set_coordinate_registers(con, setup, x_coord, y_coord):
    """
    This method also sends the change to the robot, and sets the camera out flag to True
    """
    print(f"Sending values x: {x_coord} | y: {y_coord} to the robot")
    setup.input_double_register_24 = x_coord
    setup.input_double_register_25 = y_coord

    # Flip the register to communicate that we are ready
    setup.input_bit_register_65 = not setup.input_bit_register_65
    print(f"Camera input {setup.input_bit_register_65}")

    con.send(setup)


def robot_requests_coordinates(state, last_ready_value=False):
    out = not state.output_bit_register_64 == last_ready_value
    last_ready_value = state.output_bit_register_64
    return out, last_ready_value


def generate_coordinate():
    # From the test_script
    # generated_x = x_coords[index]
    # generated_y = y_coords[index]
    #
    # index = (index + 1) % coords_length
    # counter = counter + 1

    tiles = [
        (0, 0.1),
        (0.2, 0.2),
        (0.3, 0.3),
        (0.2, 0.4),
        (0, 0.25),
    ]
    x_coords = [tile[0] for tile in tiles]
    # x_coords = [0, 0.2, 0.2, 0, .3, .1]
    # y_coords = [0.1, 0.4, 0.2, .25, .3, .3]
    y_coords = [tile[1] for tile in tiles]

    global index
    ind = index
    index += 1
    print(f"index: {index} arr_index: {ind % len(x_coords)}")
    return x_coords[ind % len(x_coords)], y_coords[ind % len(y_coords)]


if __name__ == '__main__':
    input("When ready, press enter:")
    while True:
        try:
            main()
        except ConnectionResetError:
            print("lost connection")
