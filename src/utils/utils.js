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

export const train_test_split = (
	task,
	features,
	labels,
	train_fraction = 0.8
) => {
	if ((task.value && task.value == "dummy") || task == "dummy") {
		return [features, labels, features, labels];
	}
	if ((task.value && task.value == "iris") || task == "iris") {
		//TODO shuffle the data
		let featuresMUTABLE = features.slice();
		let labelsMUTABLE = labels.slice();
		// console.log("train_test", featuresMUTABLE);
		// console.log("train_test", labelsMUTABLE);
		// shuffle
		// const shuffle_result = shuffleInSync(featuresMUTABLE, labelsMUTABLE);
		// assign the results of the shuffle to the mutable variables
		// featuresMUTABLE = shuffle_result[0];
		// labelsMUTABLE = shuffle_result[1];
		// split the shuffled data
		const train_last_index = Math.floor(
			featuresMUTABLE.length * train_fraction
		);
		const x_train = featuresMUTABLE.slice(0, train_last_index);
		const y_train = labelsMUTABLE.slice(0, train_last_index);
		const x_test = featuresMUTABLE.slice(train_last_index);
		const y_test = labelsMUTABLE.slice(train_last_index);
		return [x_train, y_train, x_test, y_test];
	}
};

function shuffleInSync(features, labels) {
	let featuresMUTABLE = features.slice();
	let labelsMUTABLE = labels.slice();
	// console.log(featuresMUTABLE);
	// console.log(labelsMUTABLE);
	if (featuresMUTABLE.length !== labelsMUTABLE.length) {
		throw new Error("Features and labels must have the same length.");
	}

	let currentIndex = featuresMUTABLE.length;

	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// Swap the elements/rows in features
		[featuresMUTABLE[currentIndex], featuresMUTABLE[randomIndex]] = [
			featuresMUTABLE[randomIndex],
			featuresMUTABLE[currentIndex],
		];

		// Swap the elements/rows in labels in sync
		[labelsMUTABLE[currentIndex], labelsMUTABLE[randomIndex]] = [
			labelsMUTABLE[randomIndex],
			labelsMUTABLE[currentIndex],
		];
	}

	return [featuresMUTABLE, labelsMUTABLE];
}

/**
 * Check if an object is a mtrix or not
 * @param {*} matrix
 * @returns
 */
export const checkIsMatrix = (matrix) => {
	if (matrix == null || matrix == undefined) return false;
	if (!Array.isArray(matrix)) return false;
	if (matrix.length === 0) return false;
	return matrix.every((row) => Array.isArray(row));
};
