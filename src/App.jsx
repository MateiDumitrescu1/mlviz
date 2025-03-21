import { useEffect, useState } from "react";
import "./App.css";
import { startTraining } from "./workerApi.mjs";

function App() {
	const run = async () => {
		console.log("calling startTraining");
		await startTraining("Hello");
	};
	useEffect(() => {
		run();
	}, []);
	return (
		<>
			<div>sadasdad</div>
		</>
	);
}

export default App;
