# Performance improvements
## Caching of computation on the client
- Could be done by using localstorage like indexedDB
  - https://web.dev/indexeddb-best-practices/
  - https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#firefox

I imagine this as storing the JS objects.
The problem is that i am using classes for functionality. 
These will have to be restored from the saved objects.
It is my understanding that saving them to localstorage will save them in a json-like format, 
which means we will lose class information, unless we add it by ourselves.

This means that we will have to make a serializer and unserializer. 


## Backend
- Bun? https://bun.sh

A backend might be useful to perform the pre-processing of the data, such as filtering and computing positions.

This might also make it easier to cache computations 
(i.e. the backend could perform the computation once, and then instantly serve that result to the client)