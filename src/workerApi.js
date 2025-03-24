// Create the worker instance.
const pyodideWorker = new Worker("./webworker.mjs", {
	type: "module",
});

// Expose an async function that sends Python code and context to the worker.
export async function startTraining(data) {
	pyodideWorker.postMessage(data);
}

export function onWorkerMessageExecute(callback) {
	pyodideWorker.addEventListener("message", callback);
}
