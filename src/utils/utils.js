import Papa from "papaparse";
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

/**
 * Loads and parses a CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Promise resolving to the parsed CSV data
 */
export const loadCSV = async (filePath) => {
	try {
		// For files in the public directory
		return new Promise((resolve, reject) => {
			Papa.parse(filePath, {
				download: true,
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				complete: (results) => {
					resolve(results.data);
				},
				error: (error) => {
					reject(error);
				},
			});
		});
	} catch (error) {
		console.error(`Error loading CSV file ${filePath}:`, error);
		throw error;
	}
};
