import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.mjs";

let pyodide = await loadPyodide();
await pyodide.loadPackage("numpy");
postMessage("numpy loaded");
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
	console.log("ran model init code");
	// Remove the first line from the Python script
	// const scriptLines = pythonScript.split("\n");
	// pythonScript = scriptLines.slice(1).join("\n");
	let epochs = 100;
	let updatedPredictions;
	try {
		for (let i = 0; i <= epochs; i++) {
			await pyodide.globals.set("epochNr", i);

			// const runScript = `i=${i};${pythonScript}`;

			const res = await pyodide.runPythonAsync(trainCode);
			const updatedWeights = await pyodide.globals.get("send_weights");
			const updatedBiases = await pyodide.globals.get("send_biases");
			// console.log(updatedWeights.toJs());
			// console.log(updatedBiases.toJs());
			updatedPredictions = await pyodide.globals.get(
				"predictions_global"
			);
		}
	} catch (error) {
		console.log(error);
	}
	// const pred_encoded = encodePredictionsToString(updatedPredictions.toJs());
	// Optionally, notify that training is complete.
	console.log("training completed");
	postMessage("training completed");
});
