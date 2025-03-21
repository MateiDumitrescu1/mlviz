import HeatMap from "react-heatmap-grid";

const WeightsHeatmap = ({ weights, layerIndex = 0 }) => {
	// Check if weights are available and the specified layer exists
	if (!weights || weights.length === 0 || !weights[layerIndex]) {
		return <div>No weights to display.</div>;
	}

	// Select the layer to visualize
	const layer = weights[layerIndex];

	// Assume each neuron in the layer is an array of weights.
	// Generate xLabels based on the number of weights per neuron.
	const xLabels = layer[0].map((_, i) => `W${i}`);
	// Generate yLabels for neurons.
	const yLabels = layer.map((_, i) => `Neuron ${i}`);

	// Data for the heatmap is the layer matrix itself.
	const data = layer;

	return (
		<div style={{ fontSize: "12px", margin: "20px" }}>
			<HeatMap
				xLabels={xLabels}
				yLabels={yLabels}
				data={data}
				// Optionally you can customize the cell rendering:
				cellStyle={(background, value, min, max, data, x, y) => ({
					background: `rgb(66, 86, 244, ${
						(value - min) / (max - min + 0.001)
					})`,
					fontSize: "11px",
					color: "#fff",
				})}
			/>
		</div>
	);
};

export default WeightsHeatmap;
