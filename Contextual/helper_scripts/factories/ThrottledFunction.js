// Adapted from:
// https://codedamn.com/news/javascript/throttling-in-javascript
// Although I modified the logic of the return function heavily, to go for immediate execution of the first call,
// and then wait for the minimum_time_between_calls before executing the next call.

/**
 *The function to throttle must be an async function.
 *
 * @param function_to_throttle {function(...[*]): Promise<void>}
 * @param minimum_time_between_calls {number}
 * @returns {function(...[*]): Promise<void>}
 */
export function get_throttled_version_function(function_to_throttle, minimum_time_between_calls) {
    let wait = false;
    let storedArgs = null;

    async function checkStoredArgs () {
        if (storedArgs == null) {
            wait = false;
        } else {
            await function_to_throttle(...storedArgs);
            storedArgs = null;
            setTimeout(checkStoredArgs, minimum_time_between_calls);
        }
    }

    return async (...args) => {
        storedArgs = args;

        if (wait) {
            return;
        }

        wait = true;
        await checkStoredArgs();
    }
}