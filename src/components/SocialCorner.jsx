import React from "react";
import { useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Switch, FormControlLabel } from "@mui/material";
import styles from "../components_styles/SocialCorner.module.scss";
const SocialCorner = ({ switchPressFunction }) => {
	const [checked, setChecked] = useState(true);

	const handleChange = (event) => {
		setChecked(event.target.checked);
		// do something with the toggle state
		switchPressFunction(event.target.checked);
		// console.log(event.target.checked);
	};
	return (
		<div className={styles.container}>
			<a
				href="https://github.com/MateiDumitrescu1/mlviz"
				target="_blank"
				rel="noopener noreferrer"
			>
				<FaGithub className={styles.icon} />
			</a>
			<a
				href="https://www.linkedin.com/in/matei-dumitrescu-999a14292/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<FaLinkedin className={styles.icon} />
			</a>
			<FormControlLabel
				control={
					<Switch
						checked={checked}
						onChange={handleChange}
						sx={{
							"& .MuiSwitch-switchBase.Mui-checked": {
								color: `var(--red070)`, // thumb color when checked
							},
							"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
								{
									backgroundColor: `var(--red070)`, // track color when checked
								},
						}}
					/>
				}
				label={"HINTS"}
			/>
		</div>
	);
};

export default SocialCorner;
