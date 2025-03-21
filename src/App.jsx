import { useEffect, useState } from 'react'
import './App.css'
import { asyncRun } from './workerApi.mjs'


function App() {

	const script = `
    import statistics
    statistics.stdev(A_rank)
  `;
	const context = {
		A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
	};
	const run = async () => {
		const { result, error } = await asyncRun(script, context);
		if (result) {
			console.log("pyodideWorker result:", result);
		} else if (error) {
			console.log("pyodideWorker error:", error);
		}

	}
	useEffect(() => {
		run()
	}, [])
	return (
		<>
			<div>
				sadasdad
			</div>
		</>
	)
}

export default App
