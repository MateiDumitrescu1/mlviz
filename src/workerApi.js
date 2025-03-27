// Create the worker instance.
const pyodideWorker = new Worker("./webworker.mjs", {
	type: "module",
});

// Expose an async function that sends Python code and context to the worker.
export async function startTraining(data) {
	pyodideWorker.postMessage(data);
}

//TODO rename this method to addWorkerEventListener
export function onWorkerMessageExecute(callback) {
	pyodideWorker.addEventListener("message", callback);
}
export function removeWorkerMessageExecute(callback) {
	pyodideWorker.removeEventListener("message", callback);
}
