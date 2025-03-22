import React, { useRef, useEffect } from "react";
import { initWeightsFromLayerNeuronCounts } from "../utils/utils";
let width;
let height;
let ctx;
const WeightsGraph = ({ weights, layerNeuronCounts }) => {
	const canvasRef = useRef(null);
	const computeNeuronPositions = (layerNeuronCounts) => {
		const neuronPositions = [];
		let numLayers = layerNeuronCounts.length;
		for (let layer = 0; layer < numLayers; layer++) {
			const count = layerNeuronCounts[layer];
			const x = ((layer + 1) * width) / (numLayers + 1);
			const positions = [];
			for (let i = 0; i < count; i++) {
				const y = ((i + 1) * height) / (count + 1);
				positions.push({ x, y });
			}
			neuronPositions.push(positions);
		}
		return neuronPositions;
	};
	const drawNeurons = (neuronPositions, layerNeuronCounts) => {
		// Draw neurons as circles, from the array of computed positions
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
		return neuronPositions;
		// Draw connections (weights) between layers.
	};
	const drawWeights = (weights, neuronPositions) => {
		if (weights.length === 0) {
			weights = initWeightsFromLayerNeuronCounts(layerNeuronCounts);
		}

		for (let i = 0; i < weights.length; i++) {
			const weightMatrix = weights[i];
			const sourcePositions = neuronPositions[i];
			const targetPositions = neuronPositions[i + 1];

			for (let j = 0; j < weightMatrix.length; j++) {
				const weightVector = weightMatrix[j]; // weightVector = weights going to j-th neuron in next layer
				for (let k = 0; k < weightVector.length; k++) {
					const weight = weightVector[k];
					const start = sourcePositions[k]; // neuron in this layer
					const end = targetPositions[j]; // neuron in next layer

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
	};
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;

		ctx.clearRect(0, 0, width, height); // Clear the canvas
		const neuronPositions = computeNeuronPositions(layerNeuronCounts);
		drawWeights(weights, neuronPositions);
		drawNeurons(neuronPositions, layerNeuronCounts);

		// Force deep checking of weights by using JSON.stringify
	}, [JSON.stringify(weights)]);

	return (
		<canvas
			ref={canvasRef}
			width={1300}
			height={900}
			style={{ border: "1px solid #ccc" }}
		/>
	);
};

export default WeightsGraph;
