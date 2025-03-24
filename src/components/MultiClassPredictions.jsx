import React, { useMemo } from "react";
import styles from "../components_styles/MultiClassPredictions.module.scss";

// Class names for the IRIS dataset
const IRIS_CLASSES = ["Setosa", "Versicolor", "Virginica"];

//* the passed in predictions parameter should be a matrix
//* the passed in true labels should be 1-hot
const MultiClassPredictions = ({ samples, trueLabels, predictions = [] }) => {
	// console.log("dsasda!!", samples);
	//TODO check if the predictions array matches the trueLabels array.

	// if it doesn't there are mp predictions yet, just render the test data
	// Calculate accuracy
	let predictionsMUTABLE = predictions;
	if (predictions && predictions.length !== 0) {
		// reverse the dimension of the predictions matrix
		predictionsMUTABLE = predictions[0].map((_, colIndex) =>
			predictions.map((row) => row[colIndex])
		);
	}

	const accuracy = useMemo(() => {
		if (!predictionsMUTABLE || predictionsMUTABLE.length === 0) return 0;
		if (predictionsMUTABLE.length !== trueLabels.length) return 0;
		// console.log("loggin from MultiClassPredictions.jsx", predictions);
		let correct = 0;
		for (let i = 0; i < trueLabels.length; i++) {
			const trueClass = trueLabels[i].indexOf(Math.max(...trueLabels[i]));
			// console.log("sadasda", predictions[i]);
			const predClass = predictionsMUTABLE[i].indexOf(
				Math.max(...predictionsMUTABLE[i])
			);
			if (trueClass === predClass) correct++;
		}

		return (correct / trueLabels.length) * 100;
	}, [trueLabels, predictionsMUTABLE]);

	// Helper function to get class name from one-hot vector
	const getClassName = (oneHotVector) => {
		if (!oneHotVector) return "#";
		const maxIndex = oneHotVector.indexOf(Math.max(...oneHotVector));
		return IRIS_CLASSES[maxIndex];
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>IRIS Classification Results</h1>
				<div className={styles.accuracyContainer}>
					<span className={styles.accuracyLabel}>Accuracy:</span>
					<span className={styles.accuracyValue}>
						{predictionsMUTABLE.length > 0
							? `${accuracy.toFixed(2)}%`
							: "No predictions yet"}
					</span>
					<div className={styles.progressBarContainer}>
						<div
							className={styles.progressBar}
							style={{ width: `${accuracy}%` }}
						></div>
					</div>
				</div>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Sample #</th>
							<th>Sepal Length</th>
							<th>Sepal Width</th>
							<th>Petal Length</th>
							<th>Petal Width</th>
							<th>True Label</th>
							<th>Predicted</th>
							<th>Result</th>
						</tr>
					</thead>
					<tbody>
						{samples.map((sample, index) => {
							const trueClass = getClassName(trueLabels[index]);
							const predClass = predictionsMUTABLE[index]
								? getClassName(predictionsMUTABLE[index])
								: "#";
							const isCorrect =
								trueClass === predClass && predClass !== "#";

							return (
								<tr key={index} className={styles.sampleRow}>
									<td>{index + 1}</td>
									<td>{sample[0].toFixed(1)}</td>
									<td>{sample[1].toFixed(1)}</td>
									<td>{sample[2].toFixed(1)}</td>
									<td>{sample[3].toFixed(1)}</td>
									<td>
										<span className={styles.label}>
											{trueClass}
										</span>
									</td>
									<td>
										{predClass === "#" ? (
											<span
												className={
													styles.placeholderLabel
												}
											>
												{predClass}
											</span>
										) : (
											<span
												className={
													isCorrect
														? styles.correctLabel
														: styles.incorrectLabel
												}
											>
												{predClass}
											</span>
										)}
									</td>
									<td>
										{predClass !== "#" && (
											<span className={styles.resultIcon}>
												{isCorrect ? "✓" : "✗"}
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default MultiClassPredictions;
