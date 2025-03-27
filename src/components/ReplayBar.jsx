import React, { useState, useRef, useEffect } from "react";
import styles from "../components_styles/ReplayBar.module.scss";

const ReplayBar = ({
	displayAtCertainEpoch,
	trainingEpochs,
	isTraining,
	loading,
	showHintsTrueOrFalse,
}) => {
	const [mousePositionX, setMousePositionX] = useState(null);
	const [mousePositionY, setMousePositionY] = useState(null);

	const [currentEpoch, setCurrentEpoch] = useState(0);
	const barRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const verticalBarWidth = 2;

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

	const calculateBlockXEndpoint = () => {
		if (!barRef.current) return "0%";
		if (mousePositionX === null) return "0%";
		const rect = barRef.current.getBoundingClientRect();
		let x = mousePositionX - rect.left;
		x = Math.max(0, Math.min(x, rect.width));
		// console.log("x", x);
		return `${x}px`;
	};
	const handleMouseDown = (e) => {
		setIsDragging(true);
		updateEpochFromPosition(e.clientX);
	};

	const handleMouseMove = (e) => {
		if (isDragging) {
			updateEpochFromPosition(e.clientX);
		}
		setMousePositionX(e.clientX);
		setMousePositionY(e.clientY);
		// console.log("dasda");
	};

	const handleMouseUp = () => {
		if (isDragging) {
			setIsDragging(false);
		}
	};

	const handleMoueLeave = () => {
		if (isDragging) {
			setIsDragging(false);
		}
		setMousePositionX(null);
		setMousePositionY(null);
	};

	// Attach global mouse events while dragging
	useEffect(() => {
		barRef.current.addEventListener("mousemove", handleMouseMove);
		barRef.current.addEventListener("mouseup", handleMouseUp);
		barRef.current.addEventListener("mouseleave", handleMoueLeave);
		return () => {
			barRef.current.removeEventListener("mousemove", handleMouseMove);
			barRef.current.removeEventListener("mouseup", handleMouseUp);
			barRef.current.removeEventListener("mouseleave", handleMoueLeave);
		};
	}, [isDragging]);

	useEffect(() => {
		setCurrentEpoch(0);
	}, [isTraining]);
	const calculateDraggableBarLeftOffset = () => {
		if (!barRef.current || trainingEpochs === 0) return "0%";
		const percentage = (currentEpoch / trainingEpochs) * 100;
		return `calc(${percentage}% - ${Math.min(
			percentage,
			verticalBarWidth / 2
		)}px)`;
	};
	return (
		<div
			className={`${styles.replayBarContainer} ${
				isTraining ? styles.duringTraining : ""
			}`}
			ref={barRef}
			onMouseDown={handleMouseDown}
		>
			<div
				className={styles.block}
				style={{ width: calculateBlockXEndpoint() }}
			></div>

			{loading && (
				<div className={styles.replayBarMessage}>Loading numpy...</div>
			)}
			{loading == false && isTraining && (
				<div className={styles.replayBarMessage}>Training...</div>
			)}
			{showHintsTrueOrFalse && (
				<p className={`${isTraining ? styles.hiddenP : ""}`}>
					after training, click or drag to replay epochs
				</p>
			)}
			<p className={styles.epochShowerP}>
				{currentEpoch}
				{"/"}
				{trainingEpochs}
			</p>
			<div
				className={`${styles.draggableBar} ${
					isTraining ? styles.draggableBarDuringTraining : ""
				}`}
				style={{
					left: calculateDraggableBarLeftOffset(),
					width: `${verticalBarWidth}px`,
				}}
			/>
		</div>
	);
};

export default ReplayBar;
