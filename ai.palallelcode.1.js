/**
 * Simulates fetching data with a delay.
 * @param {string} value The value to return.
 * @param {number} delay The delay in milliseconds.
 * @returns {Promise<string>}
 */
function asyncTask(value, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Resolving: ${value}`);
      resolve(value);
    }, delay);
  });
}

/**
 * Executes multiple async tasks in parallel and returns all their results.
 */
async function executeParallelTasks() {
  // Create an array of promises
  const promises = [
    asyncTask('First Task', 1000),
    asyncTask('Second Task', 500),
    asyncTask('Third Task', 1500)
  ];

  try {
    // Wait for all promises to resolve in parallel
    const results = await Promise.all(promises);
    console.log('All tasks completed.');
    return results; // Returns an array of values: ['First Task', 'Second Task', 'Third Task']
  } catch (error) {
    console.error('One of the tasks failed:', error);
    // Handle the rejection of any single promise
    throw error;
  }
}

// Example usage:
executeParallelTasks().then(results => {
  console.log('Final results:', results);
});
