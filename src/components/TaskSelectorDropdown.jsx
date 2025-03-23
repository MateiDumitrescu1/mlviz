// Dropdown.jsx
import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import styles from "../components_styles/TaskSelectorDropdown.module.scss";

const Dropdown = ({
	options,
	defaultOption,
	onOptionSelect,
	placeholder = "Select an option",
	className = "",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState(defaultOption || null);

	const handleSelect = (option) => {
		setSelectedOption(option);
		setIsOpen(false);
		if (onOptionSelect) {
			onOptionSelect(option);
		}
	};

	return (
		<div className={`${styles.dropdownContainer} ${className}`}>
			<button
				type="button"
				className={styles.dropdownButton}
				onClick={() => setIsOpen(!isOpen)}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<span
					className={
						selectedOption
							? styles.dropdownSelectedText
							: styles.dropdownPlaceholderText
					}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={`${styles.dropdownIcon} ${
						isOpen ? styles.open : ""
					}`}
				/>
			</button>

			{isOpen && (
				<ul
					className={styles.dropdownMenu}
					tabIndex={-1}
					role="listbox"
				>
					{options.map((option) => (
						<li
							key={option.value}
							className={`${styles.dropdownItem} ${
								selectedOption?.value === option.value
									? styles.selected
									: ""
							}`}
							onClick={() => handleSelect(option)}
							role="option"
							aria-selected={
								selectedOption?.value === option.value
							}
						>
							<div className={styles.dropdownItemContent}>
								<span>{option.label}</span>
								{selectedOption?.value === option.value && (
									<Check size={16} />
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Dropdown;
