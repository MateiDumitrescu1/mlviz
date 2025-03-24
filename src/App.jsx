import { useEffect, useState, useRef } from "react";
import "./App.css";
import { startTraining, onWorkerMessageExecute } from "./workerApi.mjs";
import WeightsGraph from "./components/WeightsGraph";
import WeightsHeatmap from "./components/WeightsHeatmap";
import PredictionsMatrix from "./components/PredictionsMatrix";
import {
	initWeightsFromLayerNeuronCounts,
	train_test_split,
} from "./utils/utils";
import TaskSelectorDropdown from "./components/TaskSelectorDropdown";
import { loadCSV } from "./utils/utils";

import MultiClassPredictions from "./components/MultiClassPredictions";

import Papa from "papaparse";

const loadCSVFile = async (path) => {
	// function to read the dataset files from the /public directory
	return fetch(path)
		.then((response) => response.text())
		.then((csvText) => {
			const result = Papa.parse(csvText, {
				header: false,
				dynamicTyping: true,
				skipEmptyLines: true,
			});
			// console.log(result);
			return result.data;
		})
		.catch((error) => console.error("Error loading CSV:", error));
};

// read the dummy multiclassification dataset
const dummyDataFeatures = await loadCSVFile("./ml_data/Dummy_features.csv");
const dummyDataLabels = await loadCSVFile("./ml_data/Dummy_labels.csv");
// read the iris dataset
const irisDataFeatures = await loadCSVFile("./ml_data/Iris_features.csv");
const irisDataLabels = await loadCSVFile("./ml_data/Iris_labels_onehot.csv");
// console.log(irisDataFeatures);
const returnDatasetBasedOnTask = (task) => {
	// given a task name, return the corresponding dataset
	// this is implemented for convenience
	if (task == null || task == undefined || task === "")
		return [dummyDataFeatures, dummyDataLabels];
	if (task === "iris") {
		return [irisDataFeatures, irisDataLabels];
	} else if (task === "dummy") {
		return [dummyDataFeatures, dummyDataLabels];
	}
};

const decodeString_weights = (encodedString) => {
	// split on # to get the layers
	// split each layer on | to get the neuron weights
	// split each neuron on , to get the weights
	let layer_strings = encodedString.split("#");
	layer_strings.pop();

	let all_weights = [];
	for (let i = 0; i < layer_strings.length; i++) {
		const neuron_strings = layer_strings[i].split("|");
		neuron_strings.pop();
		let layer_weights = [];
		for (let j = 0; j < neuron_strings.length; j++) {
			let individual_neuron_weights = neuron_strings[j].split(",");
			individual_neuron_weights.pop();
			layer_weights.push(individual_neuron_weights.map(Number));
		}
		all_weights.push(layer_weights);
	}
	return all_weights;
};
const decodeString_predictions = (encodedString) => {
	// split on # to get the rows
	// split on , to get the values
	let row_strings = encodedString.split("#");
	row_strings.pop();
	let all_predictions = [];
	for (let i = 0; i < row_strings.length; i++) {
		let individual_row = row_strings[i].split(",");
		individual_row.pop();
		all_predictions.push(individual_row.map(Number));
	}
	return all_predictions;
};

function App() {
	const [decodedWeights, setDecodedWeights] = useState([]);
	const [layerNeuronCounts, setLayerNeuronCounts] = useState([5, 10, 10, 7]);
	const [decodedPredictions, setDecodedPredictions] = useState([]);
	const [xtest, setXtest] = useState([]);
	const [ytest, setYtest] = useState([]);

	//data refs and methods
	const datasetRef = useRef(null);
	const xtrainRef = useRef(null);
	const ytrainRef = useRef(null);
	const xtestRef = useRef(null);
	const ytestRef = useRef(null);
	const initDataRefsBasedOnTask = (taskValue) => {
		datasetRef.current = returnDatasetBasedOnTask(taskValue);
		const split_result = train_test_split(
			taskValue,
			datasetRef.current[0],
			datasetRef.current[1]
		);
		xtrainRef.current = split_result[0];
		ytrainRef.current = split_result[1];
		xtestRef.current = split_result[2];
		ytestRef.current = split_result[3];
		// console.log(xtestRef.current);
	};
	// ready, loading
	const [ready, setReady] = useState(false);
	const [loading, setLoading] = useState(true);
	// task selection options
	const taskOptions = [
		{ value: "iris", label: "Iris" },
		{ value: "dummy", label: "Dummy example" },
	];
	const [selectedTask, setSelectedTask] = useState(taskOptions[1]);
	const handleSelectTask = (task) => {
		// method to pass to the dropdown menu, to select the task
		setSelectedTask(task);
		initDataRefsBasedOnTask(task.value);
		// change network configuration based on the selected task (input and output layers)
		if (task.value === "iris") {
			setLayerNeuronCounts([4, 5, 3]);
		} else if (task.value === "dummy") {
			setLayerNeuronCounts([5, 10, 10, 7]);
		}
	};
	const run = async () => {
		// send the model parameters in the event data here
		setReady(false);
		initDataRefsBasedOnTask(selectedTask.value);
		console.log("calling startTraining");
		await startTraining({
			networkLayout: layerNeuronCounts,
			task: selectedTask.value,
			x_train: xtrainRef.current,
			y_train: ytrainRef.current,
			x_test: xtestRef.current,
			y_test: ytestRef.current,
		});
	};
	const handleWeightUpdate = (event) => {
		let string = event.data;
		const obj = string;
		// the object send is not a string, it's JSON
		if (obj.xtest) {
			setXtest(obj.xtest);
			setYtest(obj.ytest);
			return;
		}
		// console.log(data);
		if (string == "numpy loaded") {
			setReady(true);
			setLoading(false);
			return;
		} else if (string == "training completed") {
			setReady(true);
			return;
		}
		const firstChar = string.charAt(0);
		string = string.slice(1);
		if (firstChar === "w") {
			const all_weights_decoded = decodeString_weights(string);
			// console.log(all_weights_decoded);
			setDecodedWeights(all_weights_decoded);
		} else if (firstChar === "p") {
			const all_predictions_decoded = decodeString_predictions(string);
			setDecodedPredictions(all_predictions_decoded);
			// console.log(all_predictions_decoded);
		}
	};
	useEffect(() => {
		if (decodedWeights == []) {
			const weights = initWeightsFromLayerNeuronCounts(layerNeuronCounts);
			setDecodedWeights(weights);
		}
		onWorkerMessageExecute(handleWeightUpdate);
	}, []);
	return (
		<>
			<button
				onClick={run}
				disabled={loading == true || ready == false}
				style={{ backgroundColor: loading ? "gray" : "initial" }}
			>
				Start Training
			</button>
			<div>
				Select a ML task. Currently set to{" "}
				{selectedTask ? selectedTask.label : "None"}
			</div>
			<TaskSelectorDropdown
				options={taskOptions}
				defaultOption={taskOptions[1]}
				onOptionSelect={handleSelectTask}
				placeholder="Select a framework"
				style={{ marginBottom: "16px" }}
			/>
			<WeightsGraph
				weights={decodedWeights}
				layerNeuronCounts={layerNeuronCounts}
				loading={loading}
			/>
			{selectedTask.value === "dummy" && (
				<>
					<PredictionsMatrix
						predictions={dummyDataLabels}
						fallback={undefined}
						title={"True Labels (One-hot encoded)"}
					/>
					<PredictionsMatrix
						predictions={decodedPredictions}
						fallback={dummyDataLabels}
						title={"Predictions (One-hot encoded)"}
					/>
				</>
			)}
			{selectedTask.value === "iris" && (
				<MultiClassPredictions
					samples={xtestRef.current}
					trueLabels={ytestRef.current}
					predictions={decodedPredictions}
				/>
			)}
		</>
	);
}

export default App;
