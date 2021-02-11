/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {useHistory} from 'react-router-dom';

import Table from 'library/components/Table';
// import SteppedProgress from 'library/components/SteppedProgress';

import styles from './project.module.scss';

interface IMeasurements {
	measurements: object[];
	requestMeasurements: (projectId: number) => void;
	match: any;
}

const Project = ({
	measurements,
	requestMeasurements,
	...props
}: IMeasurements) => {

	useEffect(() => {
		const projectId = props.match.params.projectId;
		requestMeasurements(projectId);
	}, [])

	const history = useHistory();
	const path = history.location.pathname;

	const onRowClick = (id: number) => history.push(`${path}/${id}`);

	const tHead = measurements.length ? Object.keys(measurements[0]) : [];
	const tData = measurements.map((project: object) => Object.values(project));

	return (
		<div className={styles.wrapper}>
			<Table
				head={tHead}
				data={tData}
				onRowClick={onRowClick}
			/>
		</div>
	);
};

export default Project;