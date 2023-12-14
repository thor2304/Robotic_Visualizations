- [Data collection](#Data-collection)
    - [CSV files](#CSV-files)
- [Data modelling](#Data-modelling)
- [Data model as class diagram(s)](#Data-model-as-class-diagrams)
  - [The data we have about the robot itself:](#The-data-we-have-about-the-robot-itself)
  - [The data we have about variables:](#The-data-we-have-about-variables)
  - [How these are related to time:](#How-these-are-related-to-time)
    - [Visualization types](#Visualization-types)

# Data collection
For data collection that resulted in the folder: RTDE_Data, I had the `coordinated_pickup.script` running in the simulator, and recorded the data using [UR RTDE Client: Record.py](https://github.com/UniversalRobots/RTDE_Python_Client_Library#running-examples).

This requires a `record_configuration.xml` file to specify what parameters should be recorded from the RTDE. This file has been provided in the folder next to this document.
It contains an explanation of each parameter that are useful to us. URs official explanations can be found here: [RTDE Guide](https://www.universal-robots.com/articles/ur/interface-communication/real-time-data-exchange-rtde-guide/) under field names.

> For these files, the data have been sampled at 10 Hz, but the RTDE can deliver data at up to 500 Hz.

## CSV files
I recorded the same script twice, one with only the desired inputs (the ones needed to recreate the data model). 
And once with all the parameters that the RTDE will provide.

> The CSV files use space as the delimiter

The Visual studio code extension "Rainbow csv" can color the csv, but is still very hard to read. 
Jetbrains tools have a built-in csv viewer, that can take space as a delimiter, and show it as tables. 

Each row can only hold a single value, so the Vector6d params are stored as separate columns of name: `param_x` where x denotes its place in the vector.
i.e. `target_q` is stored as the rows: `target_q_0`, `target_q_1` etc.

# Data modelling
The data modelling have been done based on the drawings created at the inspiration tour to UR.
And from the knowledge obtained from working with the robot, and the UR documentation (what values, should be computed, what is provided etc.)

I have chosen to create the model as a json object at first, since I wanted to represent nested attributes, and couldn't think of a fitting diagram type initially. 
It could be converted to a class diagram I think, but it does not feel ideal.

# Data model as class diagram(s)
To give a better overview of the data model, I have split the data model into smaller diagrams, 
that each represent a subsection of the available data.

If you start wondering about how time plays into this, skip to the section: [How these are related to time:](#How-these-are-related-to-time)

#### The data we have about the robot itself:
````mermaid
classDiagram
    class Rotation{
        +double rx
        +double ry
        +double rz
    }
    
    class Position{
        +double x
        +double y
        +double z
        +Rotation rotation
    }
    
    Position *-- Rotation
    
    class Offset{
        +double x
        +double y
        +double z
        +Rotation rotation
    }
    
    Offset *-- Rotation
    
    class Joint{
        +Position actualPosition
        +Position targetPosition
        
        +getPositionError() Offset
    }

    Joint *-- Position
    Joint *-- Offset

    class Tool{
        +Position actualPosition
        +Position targetPosition
        +Rotation actualOrientation
        +Rotation targetOrientation
        
        +double measuredForce

        +getPositionError() Offset
        +getOrientationError() Rotation
    }

    Tool *-- Position
    Tool *-- Rotation
    Tool *-- Offset
    
    class Payload{
        +double expectedMass
        +double measuredMass
    }
    
    class SafetyStatus{
        +bool isNormalMode
        +bool isReducedMode
        +bool isProtectiveStopped
        +bool isRecoveryMode
        +bool isSafeguardStopped
        +bool isSystemEmergencyStopped
        +bool isRobotEmergencyStopped
        +bool isEmergencyStopped
        +bool isViolation
        +bool isFault
        +bool isStoppedDueToSafety
    }

    class Robot{
        +Joint base
        +Joint shoulder
        +Joint elbow
        +Joint wrist1
        +Joint wrist2
        +Joint wrist3
        
        +Tool tool
        +Payload payload
        
        +SafetyStatus safetyStatus
    }
    
    Robot *-- Joint
    Robot *-- Tool
    Robot *-- Payload
    Robot *-- SafetyStatus

````
Possibly we would like to know the difference between the measured mass, and the expected mass.
This might be possible to get by comparing payload mass and tool force.

#### The data we have about variables:
````mermaid
classDiagram
    class Variable{
        +[string|double|int|bool] value
        +string type
        +string name
    }
    
    class PhysicalIO
    
    class Register
    
    class ScriptVariable
    
    PhysicalIO --|> Variable
    ScriptVariable --|> Variable
    Register --|> Variable
````

#### How these are related to time:
````mermaid
classDiagram
    class PointInTime{
        +double timeStamp
        +int lineNumber
        +string lineString
    }

    class Controller{
        +double executionTime
        +double cpuUsage
        +double installedMemory
        +double memoryUsage

        +getFreeMemoryAmount()  double
    }
    
    class DataPoint{
        +PointInTime pointInTime
        +PhysicalIO[] physicalIOBlocks
        +Register[] registers
        +ScriptVariable[] scriptVariables
        +Robot robot
        +Controller controller
    }
    
    class TimeSpan{
        +double startTimeStamp
        +double endTimeStamp
        
        +DataPoint[] pointsInTheTimeSpan 
        
        +duration() double
        -getSubTimeSpan(double startTime, double duration) TimeSpan
        +subDivide(double durationOfSubSpans) TimeSpan[]
    }
    
    TimeSpan *-- DataPoint
    DataPoint *-- PointInTime
    DataPoint *-- PhysicalIO
    DataPoint *-- Register
    DataPoint *-- ScriptVariable
    DataPoint *-- Robot
    DataPoint *-- Controller
    
    note for TimeSpan "pointsInTimeSpan is an ordered list,\n where the points are ordered \naccording to their timestamp"
    note for TimeSpan "subDivide allows us to put every datapoint\n into a large TimeSpan at first,\n and then use this method to discretize the data \ninto smaller time spans"
````

One thing that have not been added to the diagram is how we should choose what data to show from each TimeSpan, 
after the discretization has been applied.
I am especially interested in the case where multiple lines have been executed within a TimeSpan, should we color them all? 
Perhaps with a color scale according to when in the TimeSpan they happened? 
What then if the same line was executed multiple times within the TimeSpan?


## Visualization types
The following is a rough diagram of the different ways that the data should be visualized. 
While they have not yet been put into the data model above, I think it would be beneficial to find a way to do so.
I however did not want to do so until the types below make a bit more sense.
````mermaid
classDiagram
    class 3D
  
    class Position
    class Direction
  
    3D <|-- Position
    3D <|-- Direction   
  
    class 2dGraph
    
    class Continuous
    
    2dGraph <|-- Continuous
    
    class continuousNumber
    class Boolean
    
    Continuous <|-- continuousNumber
    Continuous <|-- Boolean
    
    class unknown["?"]
    class Instantaneous
    
    unknown <|-- Instantaneous
    
    class InstantaneousNumber
    
    Instantaneous <|-- InstantaneousNumber 
  
````
The idea is that 3D plots are shown in a 3D visualization, 
but there is a difference between how positions and directions are visualized.

For the difference between Continuous and Instantaneous, my thoughts are that some data will change smoothly over time, 
and the way it changes over time is the interesting part.
I would put my visualization of the TCP_error that I used for debugging that in this category.
For Instantaneous data, the value at a given point in time is the interesting part. 
And the value may change sharply between two points in time.
This could for instance be internal variables, which can be set and unset rapidly. 
If this were modelled in the continuous view, it might be hard to spot. 
This thought might be hinting that we should have a filter or something on the plot,
that can highlight when data is changing rapidly or sharply.

My thoughts on the difference between continuous and Instantaneous 
is also that the user should be able to choose which category the variable should fall into.

I do not yet have a good idea for how we should visualize the instantaneous data.

It might be a good idea to make it possible for the user to choose whether they want to stack some of the data into 
the same graph/plot, or if they want to have it in separate plots.

Some data is inherently connected together, and therefore makes sense to visualize in the same plot (like the x,y,z errors that i visualized).
It might also be a way to test theories of correlation between different variables, if they are visualized together.
