Writing to and reading from a file are asynchronous operations.
In our case, there wasn’t enough time to write the data
to data.txt before the process.exit() function was executed.

Solution: The saveDataToFile and restoreDataFromFile functions should return a Promise<void>
and be marked as async. These functions should be called with await to ensure that execution
only continues once all the data has been successfully written or read and the promise is resolved.
This guarantees that the file operations complete correctly before the application exits.