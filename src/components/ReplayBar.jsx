import React, { useState, useRef, useEffect } from "react";
import styles from "../components_styles/ReplayBar.module.scss";

const ReplayBar = ({ displayAtCertainEpoch, trainingEpochs, isTraining }) => {
	const [currentEpoch, setCurrentEpoch] = useState(0);
	const barRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);

	const verticalBarWidth = 4;

	// Computes the epoch number based on the mouse position relative to the replay bar.
	const updateEpochFromPosition = (clientX) => {
		if (!barRef.current) return;
		const rect = barRef.current.getBoundingClientRect();
		// Calculate x relative to the bar and ensure it's within bounds.
		let x = clientX - rect.left;
		x = Math.max(0, Math.min(x, rect.width));
		const newEpoch = Math.round((x / rect.width) * trainingEpochs);
		setCurrentEpoch(newEpoch);
		displayAtCertainEpoch(newEpoch);
	};

	const handleMouseDown = (e) => {
		setIsDragging(true);
		updateEpochFromPosition(e.clientX);
	};

	const handleMouseMove = (e) => {
		if (isDragging) {
			updateEpochFromPosition(e.clientX);
		}
	};

	const handleMouseUp = () => {
		if (isDragging) {
			setIsDragging(false);
		}
	};

	// Attach global mouse events while dragging
	useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		} else {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging]);

	return (
		<div
			className={`${styles.replayBarContainer} ${
				isTraining ? styles.training : ""
			}`}
			ref={barRef}
			onMouseDown={handleMouseDown}
		>
			<div
				className={styles.draggableBar}
				style={{
					left: `calc(${(currentEpoch / trainingEpochs) * 100}% - ${
						verticalBarWidth / 2
					}px)`,
					width: `${verticalBarWidth}px`,
				}}
			/>
		</div>
	);
};

export default ReplayBar;
