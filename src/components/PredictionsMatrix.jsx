import React from "react";
import styles from "../components_styles/PredictionsMatrix.module.scss";
const convert = (predictions) => {
	// check if predictions are one-hot encoded
	// console.log("Type of predictions:", typeof predictions);
	// console.log("predictiosn from matrix clg", predictions);
	// console.log("predictions[0]", predictions[0]);
	const isOneHotEncoded = predictions[0].length > 1;

	if (isOneHotEncoded) {
		// convert one-hot encoded predictions to class labels
		return predictions.map((row) => row.indexOf(Math.max(...row)));
	}
};
const PredictionsMatrix = ({ predictions, fallback, title }) => {
	let predictionsMUTABLE = predictions;
	if (!predictionsMUTABLE || predictionsMUTABLE.length === 0) {
		if (!fallback || fallback.length === 0 || fallback == undefined) {
			throw new Error(
				"No predictions or fallback data available. The prediction data should have been set."
			);
		} else {
			predictionsMUTABLE = fallback;
			// predictionsMUTABLE = convert(predictionsMUTABLE);
			// console.log("sdasdada");
			// zero out every entry in the matrix
			predictionsMUTABLE = predictionsMUTABLE.map((row) =>
				row.map(() => 0)
			);
		}
	} else {
		// console.log(predictions);
		// predictionsMUTABLE = convert(predictionsMUTABLE);
	}

	// Interpolate between blue (0: rgb(0, 0, 255)) and yellow (1: rgb(255, 255, 0))
	const interpolateColor = (value) => {
		// Clamp value between 0 and 1
		const v = Math.min(Math.max(value, 0), 1);
		const r = Math.round(255 * v);
		const g = Math.round(255 * v);
		const b = Math.round(255 * (1 - v));
		return `rgb(${r}, ${g}, ${b})`;
	};

	// Render a grid where each cell is a square
	return (
		<div className={styles.container}>
			<div className={styles.title}>{title}</div>
			{predictionsMUTABLE.map((row, rowIndex) => (
				<div key={rowIndex} className={styles.tableRow}>
					{row.map((cell, cellIndex) => (
						<div
							key={cellIndex}
							style={{
								width: 30,
								height: 30,
								backgroundColor: interpolateColor(cell),
								border: "1px solid #ddd",
							}}
						/>
					))}
				</div>
			))}
		</div>
	);
};

export default PredictionsMatrix;
