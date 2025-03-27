import React, { useEffect, useRef, useState } from "react";

// Pixel class for pixel animation
class Pixel {
	constructor(canvas, context, x, y, color, speed, delay) {
		this.width = canvas.width;
		this.height = canvas.height;
		this.ctx = context;
		this.x = x;
		this.y = y;
		this.color = color;
		this.speed = this.getRandomValue(0.1, 0.9) * speed;
		this.size = 0;
		this.sizeStep = Math.random() * 0.4;
		this.minSize = 0.5;
		this.maxSizeInteger = 2;
		this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
		this.delay = delay;
		this.counter = 0;
		this.counterStep =
			Math.random() * 4 + (this.width + this.height) * 0.01;
		this.isIdle = false;
		this.isReverse = false;
		this.isShimmer = false;
	}

	getRandomValue(min, max) {
		return Math.random() * (max - min) + min;
	}

	draw() {
		const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;

		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(
			this.x + centerOffset,
			this.y + centerOffset,
			this.size,
			this.size
		);
	}

	appear() {
		this.isIdle = false;

		if (this.counter <= this.delay) {
			this.counter += this.counterStep;
			return;
		}

		if (this.size >= this.maxSize) {
			this.isShimmer = true;
		}

		if (this.isShimmer) {
			this.shimmer();
		} else {
			this.size += this.sizeStep;
		}

		this.draw();
	}

	disappear() {
		this.isShimmer = false;
		this.counter = 0;

		if (this.size <= 0) {
			this.isIdle = true;
			return;
		} else {
			this.size -= 0.1;
		}

		this.draw();
	}

	shimmer() {
		if (this.size >= this.maxSize) {
			this.isReverse = true;
		} else if (this.size <= this.minSize) {
			this.isReverse = false;
		}

		if (this.isReverse) {
			this.size -= this.speed;
		} else {
			this.size += this.speed;
		}
	}
}

const PixelCanvas = ({ colors, gap, speed, noFocus }) => {
	const canvasRef = useRef(null);
	const pixelsRef = useRef([]);
	const animationRef = useRef(null);
	const parentRef = useRef(null);
	const timeIntervalRef = useRef(1000 / 60);
	const timePreviousRef = useRef(performance.now());

	// Parse props with defaults - moved outside useEffect to update when props change
	const colorArray = colors?.split(",").map((color) => color.trim());

	const gapValue = Math.max(4, Math.min(50, parseInt(gap || 5, 10)));
	const speedValue =
		Math.max(0, Math.min(100, parseInt(speed || 35, 10))) * 0.001;

	const [reducedMotion, setReducedMotion] = useState(false);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// This useEffect only handles the reduced motion preference and resize observer
	useEffect(() => {
		// Check for reduced motion preference
		setReducedMotion(
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		);

		// Set up resize observer
		const resizeObserver = new ResizeObserver(() => {
			const rect = parentRef.current?.getBoundingClientRect();
			if (rect) {
				setDimensions({
					width: Math.floor(rect.width),
					height: Math.floor(rect.height),
				});
			}
		});

		if (parentRef.current) {
			// Initial dimensions
			const rect = parentRef.current.getBoundingClientRect();
			setDimensions({
				width: Math.floor(rect.width),
				height: Math.floor(rect.height),
			});

			resizeObserver.observe(parentRef.current);
		}

		return () => {
			cancelAnimationFrame(animationRef.current);
			resizeObserver.disconnect();
		};
	}, []);

	// This useEffect initializes the canvas when dimensions, colors, gap, or speed change
	useEffect(() => {
		if (dimensions.width > 0 && dimensions.height > 0) {
			initCanvas();
		}
	}, [dimensions, colors, gap, speed, reducedMotion]);

	// Setup event listeners
	useEffect(() => {
		const parent = parentRef.current;

		if (!parent) return;

		const handleMouseEnter = () => handleAnimation("appear");
		const handleMouseLeave = () => handleAnimation("disappear");
		const handleFocusIn = (e) => {
			if (e.currentTarget.contains(e.relatedTarget)) return;
			handleAnimation("appear");
		};
		const handleFocusOut = (e) => {
			if (e.currentTarget.contains(e.relatedTarget)) return;
			handleAnimation("disappear");
		};

		parent.addEventListener("mouseenter", handleMouseEnter);
		parent.addEventListener("mouseleave", handleMouseLeave);

		if (!noFocus) {
			parent.addEventListener("focusin", handleFocusIn);
			parent.addEventListener("focusout", handleFocusOut);
		}

		return () => {
			parent.removeEventListener("mouseenter", handleMouseEnter);
			parent.removeEventListener("mouseleave", handleMouseLeave);

			if (!noFocus) {
				parent.removeEventListener("focusin", handleFocusIn);
				parent.removeEventListener("focusout", handleFocusOut);
			}
		};
	}, [noFocus]);

	const initCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");

		// Set canvas dimensions
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;
		canvas.style.width = `${dimensions.width}px`;
		canvas.style.height = `${dimensions.height}px`;

		// Create pixels
		createPixels(canvas, ctx);

		// Debug log to verify props are being used
		// console.log("Canvas initialized with:", {
		// 	colors: colorArray,
		// 	gap: gapValue,
		// 	speed: speedValue,
		// 	width: dimensions.width,
		// 	height: dimensions.height,
		// 	pixelCount: pixelsRef.current.length,
		// });
	};

	const getDistanceToCanvasCenter = (canvas, x, y) => {
		const dx = x - canvas.width / 2;
		const dy = y - canvas.height / 2;
		return Math.sqrt(dx * dx + dy * dy);
	};

	const createPixels = (canvas, ctx) => {
		const pixels = [];

		for (let x = 0; x < canvas.width; x += gapValue) {
			for (let y = 0; y < canvas.height; y += gapValue) {
				const color =
					colorArray[Math.floor(Math.random() * colorArray.length)];
				// console.log("color", color);
				//TODO delete this reduced motion bullshit
				const delay = reducedMotion
					? 0
					: getDistanceToCanvasCenter(canvas, x, y);

				pixels.push(
					new Pixel(canvas, ctx, x, y, color, speedValue, delay)
				);
			}
		}

		pixelsRef.current = pixels;
	};

	const handleAnimation = (fnName) => {
		cancelAnimationFrame(animationRef.current);
		animationRef.current = requestAnimationFrame(() => animate(fnName));
	};

	const animate = (fnName) => {
		animationRef.current = requestAnimationFrame(() => animate(fnName));

		const timeNow = performance.now();
		const timePassed = timeNow - timePreviousRef.current;

		if (timePassed < timeIntervalRef.current) return;

		timePreviousRef.current =
			timeNow - (timePassed % timeIntervalRef.current);

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < pixelsRef.current.length; i++) {
			pixelsRef.current[i][fnName]();
		}

		if (pixelsRef.current.every((pixel) => pixel.isIdle)) {
			cancelAnimationFrame(animationRef.current);
		}
	};

	// Use a style object to avoid tailwind dependencies
	const containerStyle = {
		width: "100%",
		height: "100%",
		overflow: "hidden",
	};

	const canvasStyle = {
		width: "100%",
		height: "100%",
	};

	return (
		<div ref={parentRef} style={containerStyle}>
			<canvas ref={canvasRef} style={canvasStyle} />
		</div>
	);
};

const PixelCanvasBackground = ({ colors, gap, speed, noFocus }) => {
	return (
		<PixelCanvas
			colors={colors}
			gap={gap}
			speed={speed}
			noFocus={noFocus}
		/>
	);
};

export default PixelCanvasBackground;
