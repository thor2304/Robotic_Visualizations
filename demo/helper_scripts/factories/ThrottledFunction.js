/**
 *The function to throttle must be an async function.
 *
 * @param function_to_throttle {function}
 * @param minimum_time_between_calls
 * @returns {Promise<(function(...[*]): void)|*>}
 */
function call_throttled_async(function_to_throttle, minimum_time_between_calls) {
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