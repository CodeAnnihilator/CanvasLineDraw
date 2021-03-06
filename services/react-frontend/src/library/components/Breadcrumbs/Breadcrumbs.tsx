/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {useLocation} from 'react-router-dom'

import LinkedPath from './Frames/LinkedPath';
import ProjectMeasurementContainer from './Frames/ProjectMeasurement/ProjectMeasurementContainer';
import CurrentProjectContainer from './Frames/CurrentProject/CurrentProjectContainer';
import NewProjectContainer from './Frames/NewProject/NewProjectContainer';

import routeRenderType from './utils/routeRenderType';

import styles from './breadcrumbs.module.scss';

interface IBreadcrumbs {
	requestProjectById: (id: number) => void;
	requestMeasurementById: (id: number) => void;
	projectName: string;
	measurementName: string;
}

const Breadcrumbs = ({
	requestProjectById,
	requestMeasurementById,
	projectName,
	measurementName,
}: IBreadcrumbs) => {

	const {pathname} = useLocation();
	const splittedRoutePath = pathname.split('/').filter(sub => sub !== '');
	const type = routeRenderType(splittedRoutePath);

	useEffect(() => {
		if (type === 'currentProject' || type === 'projectMeasurement') {
			const projectId = parseInt(splittedRoutePath[1], 10);
			requestProjectById(projectId);
		}
		if (type === 'projectMeasurement') {
			const measurementId = parseInt(splittedRoutePath[2], 10);
			requestMeasurementById(measurementId)
		}
	}, [pathname]);

	return (
		<div className={styles.wrapper}>
			<LinkedPath
				projectName={projectName}
				measurementName={measurementName}
			/>
			{type === 'newProject' && <NewProjectContainer />}
			{type === 'currentProject' && <CurrentProjectContainer />}
			{type === 'projectMeasurement' && <ProjectMeasurementContainer />}
		</div>
	);
};

export default Breadcrumbs;
