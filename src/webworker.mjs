import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.mjs";

let pyodide = await loadPyodide();
await pyodide.loadPackage("numpy");
console.log("numpy loaded");
// Listen for messages from the main thread.
// For now, we don't use any data from the event but keep the option open.
const getPythonCode = async (file) => {
	const response = await fetch(`./ml/${file}`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch Python script: ${response.statusText}`
		);
	}
	const pythonScript = await response.text();
	return pythonScript;
};
self.addEventListener("message", async (event) => {
	console.log("starting training");

	// get the hode
	let initModelCode = await getPythonCode("init_model.py");
	let trainCode = await getPythonCode("train.py");
	// initialize the model and the training example
	await pyodide.runPythonAsync(initModelCode);

	// Remove the first line from the Python script
	// const scriptLines = pythonScript.split("\n");
	// pythonScript = scriptLines.slice(1).join("\n");
	let epochs = 100;
	try {
		for (let i = 1; i <= epochs; i++) {
			// const runScript = `i=${i};${pythonScript}`;

			const res = await pyodide.runPythonAsync(trainCode);
			const updatedWeights = await pyodide.globals.get("send_weights");
			const updatedBiases = await pyodide.globals.get("send_biases");
			// console.log(updatedWeights.toJs());
			// console.log(updatedBiases.toJs());
			const updatedPredictions = await pyodide.globals.get(
				"predictions_global"
			);
			// console.log(updatedPredictions.toJs());
		}
	} catch (error) {
		console.log(error);
	}

	// Optionally, notify that training is complete.
	console.log("training complete");
	// postMessage({ status: "training complete" });
});
