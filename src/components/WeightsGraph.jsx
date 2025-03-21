import React, { useRef, useEffect } from "react";

const WeightsGraph = ({ weights }) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		const width = canvas.width;
		const height = canvas.height;

		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		if (!weights || weights.length === 0) return;
		// console.log(weights[0][0]);
		// Determine the number of layers and neurons per layer.
		const numLayers = weights.length + 1;
		const layerNeurons = [];

		// Determine input layer neurons (from first weight matrix)
		const inputCount = weights[0][0].length;
		layerNeurons.push(inputCount);

		// Each weight matrix gives the neuron count for the next layer.
		weights.forEach((matrix) => {
			layerNeurons.push(matrix.length);
		});

		// Compute positions for each neuron in each layer.
		const neuronPositions = [];
		for (let layer = 0; layer < numLayers; layer++) {
			const count = layerNeurons[layer];
			const x = ((layer + 1) * width) / (numLayers + 1);
			const positions = [];
			for (let i = 0; i < count; i++) {
				const y = ((i + 1) * height) / (count + 1);
				positions.push({ x, y });
			}
			neuronPositions.push(positions);
		}

		// Draw connections (weights) between layers.
		for (let i = 0; i < weights.length; i++) {
			const weightMatrix = weights[i];
			const sourcePositions = neuronPositions[i];
			const targetPositions = neuronPositions[i + 1];

			for (let j = 0; j < weightMatrix.length; j++) {
				const weightVector = weightMatrix[j];
				for (let k = 0; k < weightVector.length; k++) {
					const weight = weightVector[k];
					const start = sourcePositions[k];
					const end = targetPositions[j];

					ctx.beginPath();
					ctx.moveTo(start.x, start.y);
					ctx.lineTo(end.x, end.y);

					// New scaling: Exaggerate opacity for bigger weights, and reduce thickness scaling.
					// Calculate opacity so that small weights (~0) are ~0.3 opaque,
					// and larger weights approach 1 (using tanh for a smooth transition).
					const opacity = Math.abs(weight) - 0.2;
					// Clamp opacity to [0, 1]
					const clampedOpacity = Math.min(Math.max(opacity, 0), 1);
					// Set stroke color based on sign: blue for positive, red for negative.
					ctx.strokeStyle =
						weight >= 0
							? `rgba(0, 0, 255, ${clampedOpacity})`
							: `rgba(255, 0, 0, ${clampedOpacity})`;
					// Line thickness scales less aggressively now.
					ctx.lineWidth = 0.1 + Math.abs(clampedOpacity) * 1.1;
					ctx.stroke();
				}
			}
		}

		// Draw neurons as circles.
		const neuronRadius = 12;
		neuronPositions.forEach((layer) => {
			layer.forEach((pos) => {
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, neuronRadius, 0, Math.PI * 2);
				ctx.fillStyle = "#fff";
				ctx.fill();
				ctx.strokeStyle = "#000";
				ctx.stroke();
			});
		});
		// Force deep checking of weights by using JSON.stringify
	}, [JSON.stringify(weights)]);

	return (
		<canvas
			ref={canvasRef}
			width={1200}
			height={800}
			style={{ border: "1px solid #ccc" }}
		/>
	);
};

export default WeightsGraph;
