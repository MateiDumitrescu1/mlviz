export const initWeightsFromLayerNeuronCounts = (layerNeuronCounts) => {
	const weights = [];
	const nrLayers = layerNeuronCounts.length;
	for (let i = 1; i < nrLayers; i++) {
		const nrNeuronsPastLayer = layerNeuronCounts[i - 1];
		const nrNeuronsNextLayer = layerNeuronCounts[i];
		const matrix = makeMatrix(nrNeuronsNextLayer, nrNeuronsPastLayer);
		weights.push(matrix);
	}
	return weights;
};
const makeMatrix = (rows, cols) => {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => Math.random())
	);
};
