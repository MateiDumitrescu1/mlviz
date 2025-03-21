import { useEffect, useState, useRef } from "react";
import "./App.css";
import { startTraining, onWorkerMessageExecute } from "./workerApi.mjs";
import WeightsGraph from "./components/WeightsGraph";
import WeightsHeatmap from "./components/WeightsHeatmap";
const decodeString = (encodedString) => {
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
function App() {
	const weightsRef = useRef(0);
	// const predictionsRef = useRef(0);
	const [decodedWeights, setDecodedWeights] = useState([]);
	const run = async () => {
		console.log("calling startTraining");
		await startTraining("Hello");
	};
	const handleWeightUpdate = (event) => {
		const data = event.data;
		weightsRef.current = data;
		// console.log(data);
		const all_weights_decoded = decodeString(data);
		// console.log(all_weights_decoded);
		setDecodedWeights(all_weights_decoded);
	};
	useEffect(() => {
		run();
		onWorkerMessageExecute(handleWeightUpdate);
	}, []);
	return (
		<>
			<button onClick={run}>Start</button>
			<WeightsGraph weights={decodedWeights} />
		</>
	);
}

export default App;
