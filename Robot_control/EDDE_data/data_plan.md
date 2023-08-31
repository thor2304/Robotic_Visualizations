# Description of runs

Each run will be described with a table.
Each column is the tile number, and each row is a loop.
The cell will contain one of the following shorthands denoting how it is picked up or not picked up:

- `Picked` picked up
- `Miss` the tile is not there at all
- `Partial` The tile is picked up by 1 of the two suction cups
- `overlap` The tile is picked up by 1 of the two suction cups, and overlaps halfway with the other

## Robot settings
Each run will be run with movel with `a=1.2` and `v=0.25`.
The gripper will be triggered with a vacuum of `0.1` unless otherwise specified.

I forgot to dial the speed down for the first two runs, so there is also a control run with high speeds and the central_miss run with high speed and acc.

The runs will be made with the regular suction cups, 
but it is also possible to change to the smaller suction cups.
The smaller cups have a lighter grip, which, makes it easier to drop the tile.

# The runs

## Control (4 loops) 1 run

> control.csv

| Loop | 1      | 2      | 3      | 4      | 5      |
|------|--------|--------|--------|--------|--------|
| 1    | Picked | Picked | Picked | Picked | Picked |
| 2    | Picked | Picked | Picked | Picked | Picked |
| 3    | Picked | Picked | Picked | Picked | Picked |
| 4    | Picked | Picked | Picked | Picked | Picked |

I accidentally let the robot begin on a 5th loop. The data will have to be cleaned to remove that.

## Different failure modes (1 loop each) 7 runs

> central_miss.csv

| Loop | 1      | 2      | 3          | 4      | 5      |
|------|--------|--------|------------|--------|--------|
| 1    | Picked | Picked | **_Miss_** | Picked | Picked |

<br>


> 2_4_miss.csv

| Loop | 1      | 2          | 3      | 4          | 5      |
|------|--------|------------|--------|------------|--------|
| 1    | Picked | **_Miss_** | Picked | **_Miss_** | Picked |

<br>

> central_partial.csv

| Loop | 1      | 2      | 3             | 4      | 5      |
|------|--------|--------|---------------|--------|--------|
| 1    | Picked | Picked | **_Partial_** | Picked | Picked |

<br>

> 2_4_partial.csv

| Loop | 1      | 2             | 3      | 4             | 5      |
|------|--------|---------------|--------|---------------|--------|
| 1    | Picked | _**Partial**_ | Picked | **_Partial_** | Picked |

<br>

> central_overlap.csv

| Loop | 1      | 2      | 3             | 4      | 5      |
|------|--------|--------|---------------|--------|--------|
| 1    | Picked | Picked | **_overlap_** | Picked | Picked |

<br>

> 2_4_overlap.csv

| Loop | 1      | 2             | 3      | 4             | 5      |
|------|--------|---------------|--------|---------------|--------|
| 1    | Picked | **_overlap_** | Picked | **_overlap_** | Picked |

<br>

As well as the 6 runs, there is a run where the tile is held down by hand (with a lower than normal vacuum),
which forces the robot to not grab the tile.
> tile_hold.csv

| Loop | 1      | 2      | 3               | 4      | 5      |
|------|--------|--------|-----------------|--------|--------|
| 1    | Picked | Picked | **_Held down_** | Picked | Picked |

<br>

## Failure ridden run (7 loops) 1 run

> long_failure.csv

| Loop | 1          | 2          | 3          | 4          | 5          |
|------|------------|------------|------------|------------|------------|
| 1    | Picked     | Picked     | **_Miss_** | Picked     | Picked     |
| 2    | **_Miss_** | Picked     | Picked     | Picked     | Picked     |
| 3    | Picked     | **_Miss_** | Picked     | Picked     | Picked     |
| 4    | Picked     | Picked     | Picked     | **_Miss_** | Picked     |
| 5    | Picked     | Picked     | Picked     | Picked     | **_Miss_** |
| 6    | Picked     | **_Miss_** | Picked     | **_Miss_** | Picked     |
| 7    | **_Miss_** | Picked     | Picked     | Picked     | **_Miss_** |

## Pushing the robot
The following two runs will be executed by pushing the robot at the specified tiles,
while it is moving down towards picking them up.

### Pushing the robot a little bit (1 loop) 1 run

> pushed.csv

| Loop | 1                     | 2                          | 3                          | 4                          | 5                          |
|------|-----------------------|----------------------------|----------------------------|----------------------------|----------------------------|
| 1    | Push on _**gripper**_ | Push on wrist _**y**_ axis | Push on wrist **_x_** axis | Push on elbow **_y_** axis | Push on elbow **_x_** axis |

### Pushing the robot enough to make it stop (1 loop) 1 run
> hard_push.csv

| Loop | 1                     | 2                          | 3                          | 4                          | 5                          |
|------|-----------------------|----------------------------|----------------------------|----------------------------|----------------------------|
| 1    | Push on _**gripper**_ | Push on wrist _**y**_ axis | Push on wrist **_x_** axis | Push on elbow **_y_** axis | Push on elbow **_x_** axis |

At tile 2 i did not manage to push hard enough on the robot in time, so it picked up the tile. Then i pushed hard enough and it stopped.

At tile 4 the cable to the gripper disconnected, which made the program stop running.
I reconnected the cable and reset the robot to home (prerequisite for the program to run). 
The script gave the robot the coordinates for tile 5, which means that the attempt at tile 4 is incomplete.

I did not manage to push on the elbow to make it stop, i believe the angles i chose where not that smart, since i would be pushing perpendicular to the shoulder.


I forgot to stop EDDE, so it continued to collect data when i started a new test run for high_pickup.csv

## Pickup point further from the tile (1 loop) 1 run
> high_pickup.csv

| Loop | 1       | 2       | 3       | 4       | 5       |
|------|---------|---------|---------|---------|---------|
| 1    | Picked? | Picked? | Picked? | Picked? | Picked? |

For this run I will write down whether the tile was in fact picked up or not.
The aim of this is to have the pickup point, _just right_ so that the tile is sometimes dropped.

