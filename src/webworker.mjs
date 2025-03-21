import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.mjs";

let pyodide = await loadPyodide();

// Listen for messages from the main thread.
// For now, we don't use any data from the event but keep the option open.
self.addEventListener("message", async (event) => {
	console.log("starting training");
	const response = await fetch("./ml/neural.py");
	if (!response.ok) {
		throw new Error(
			`Failed to fetch Python script: ${response.statusText}`
		);
	}
	let pythonScript = await response.text();

	// Remove the first line from the Python script
	const scriptLines = pythonScript.split("\n");
	pythonScript = scriptLines.slice(1).join("\n");
	try {
		for (let i = 0; i <= 5; i++) {
			const runScript = `i=${i};${pythonScript}`;
			const res = await pyodide.runPythonAsync(runScript);
			console.log(res);
		}
	} catch (error) {
		console.log(error);
	}

	// Optionally, notify that training is complete.
	console.log("training complete");
	postMessage({ status: "training complete" });
});
