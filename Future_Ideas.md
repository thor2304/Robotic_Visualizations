# Performance improvements
## Backend
- Bun? https://bun.sh

A backend might be useful to perform the pre-processing of the data, such as filtering and computing positions.

This might also make it easier to cache computations 
(i.e. the backend could perform the computation once, and then instantly serve that result to the client)