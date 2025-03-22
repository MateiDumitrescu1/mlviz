import { useEffect, useState, useRef } from "react";
import "./App.css";
import { startTraining, onWorkerMessageExecute } from "./workerApi.mjs";
import WeightsGraph from "./components/WeightsGraph";
import WeightsHeatmap from "./components/WeightsHeatmap";
import PredictionsMatrix from "./components/PredictionsMatrix";
import { initWeightsFromLayerNeuronCounts } from "./utils/utils";
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
	const run = async () => {
		console.log("calling startTraining");
		await startTraining("Hello");
	};
	const handleWeightUpdate = (event) => {
		let string = event.data;
		// console.log(data);
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
			<button onClick={run}>Start</button>
			<WeightsGraph
				weights={decodedWeights}
				layerNeuronCounts={layerNeuronCounts}
			/>
			<PredictionsMatrix predictions={decodedPredictions} />
		</>
	);
}

export default App;
