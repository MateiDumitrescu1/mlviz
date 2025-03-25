import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.mjs";

let pyodide = await loadPyodide();
await pyodide.loadPackage("numpy");
postMessage("numpy loaded");
console.log("numpy loaded");
// Listen for messages from the main thread.
// For now, we don't use any data from the event but keep the option open.
const getPythonCode = async (file) => {
	const response = await fetch(`./ml_python_code/${file}`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch Python script: ${response.statusText}`
		);
	}
	const pythonScript = await response.text();
	return pythonScript;
};
self.addEventListener("message", async (event) => {
	const networkLayout = event.data.networkLayout;
	await pyodide.globals.set("NNlayout", networkLayout);

	//* create and set the list of activation functions
	let activationFunctions = [];
	for (let i = 1; i < networkLayout.length; i++) {
		if (i === networkLayout.length - 1) {
			activationFunctions.push("softmax");
		} else {
			activationFunctions.push("tanh");
		}
	}
	await pyodide.globals.set("NNactivations", activationFunctions);

	//* set the loss function parameter
	const lossFunction = "categorical_cross_entropy";
	await pyodide.globals.set("NNloss", lossFunction);
	//* set the ML task
	const task = event.data.task;
	await pyodide.globals.set("taskSelected", task);
	//* read the dataset: x_train, y_train, x_test, y_test
	const data = event.data;
	const x_train = data.x_train;
	const y_train = data.y_train;
	const x_test = data.x_test;
	const y_test = data.y_test;
	//* set the global variables
	await pyodide.globals.set("x_train_global", x_train);
	await pyodide.globals.set("y_train_global", y_train);
	await pyodide.globals.set("x_test_global", x_test);
	await pyodide.globals.set("y_test_global", y_test);

	// console.log("printing the features from webworker", features);
	// console.log("printing the labels from webworker", labels);
	// console.log("printing the layout from webworker", networkLayout);
	// console.log(task);
	//* set the learning rate
	if (task === "iris") {
		await pyodide.globals.set("learning_rate_global", 0.1);
	} else if (task === "dummy") {
		await pyodide.globals.set("learning_rate_global", 1);
	}
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
			// console.log("epochNr", i);
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
