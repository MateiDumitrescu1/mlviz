import React from "react";

const PredictionsMatrix = ({ predictions }) => {
	if (!predictions || predictions.length === 0) {
		return <div>No predictions available.</div>;
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
		<div style={{ display: "inline-block", border: "1px solid #ccc" }}>
			{predictions.map((row, rowIndex) => (
				<div key={rowIndex} style={{ display: "flex" }}>
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
