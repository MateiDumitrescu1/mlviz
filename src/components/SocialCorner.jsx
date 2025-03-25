import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import styles from "../components_styles/SocialCorner.module.scss";
const SocialCorner = () => {
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
		</div>
	);
};

export default SocialCorner;
