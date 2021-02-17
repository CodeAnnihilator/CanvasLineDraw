/* eslint-disable react-hooks/exhaustive-deps */
import {useRef, useEffect, useState, BaseSyntheticEvent} from 'react';

import SubHeader from 'library/components/SubHeader';
import stopTracks from 'library/utilities/stopTracks';

import SettingsContainer from './Frames/Settings/SettingsContainer';

import handleNextStream from './utils/handleNextStream';
import handleTakePicture from './utils/handleTakePicture';
import {getCanvasAndContext, clearCanvas, getNextCoordinate, getOCRCropImage} from './utils/canvas';

import styles from './measurement.module.scss';

interface IMouseEvent extends BaseSyntheticEvent {
	clientX: number;
	clientY: number;
}

interface IMeasurement {
	activeStep: number;
	activeCameraId: string;
	isCalibrationActive: boolean;
	calibration: number;
	pictureLabel: string;
	saveCameras: (cameras: object[]) => void;
	requestOCRMeasurement: (measurement: any) => void;
	setIsCalibrationActive: (isActive: boolean) => void;
}

const Measurements = ({
	activeStep,
	activeCameraId,
	isCalibrationActive,
	calibration,
	pictureLabel,
	saveCameras,
	requestOCRMeasurement,
	setIsCalibrationActive,
}: IMeasurement) => {

	const refStream = useRef<HTMLVideoElement>(null);
	const refPicture = useRef<HTMLImageElement>(null);
	const refPicureCanvas = useRef<HTMLCanvasElement>(null);
	const refServiceCanvas = useRef<HTMLCanvasElement>(null);
	const refMeasureCanvas = useRef<HTMLCanvasElement>(null);

	const [stream, setNextStream] = useState(null as any);
	const [picture, setPicture] = useState(null as any);
	const [mCoords, setNextMCoord] = useState([] as any);

	useEffect(() => {
		(async function() {
			if (mCoords.length === 4) {
				const img = await getOCRCropImage(refPicture, refPicureCanvas, refServiceCanvas, mCoords);
				requestOCRMeasurement({coords: mCoords, img});
				setIsCalibrationActive(false);
			}
		})()
	}, [mCoords])

	useEffect(() => {
		(async () => {
			await navigator.mediaDevices.getUserMedia({video: true}).then(stopTracks);
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoInputs = devices.filter(device => device.kind === 'videoinput');
			saveCameras(videoInputs);
			handleSetNextStream();
		})();
	}, []);

	useEffect(() => {
		if (!calibration) {
			setNextMCoord([]);
			const {canvas} = getCanvasAndContext(refMeasureCanvas);
			clearCanvas(canvas);
		};
	}, [calibration])

	useEffect(() => {
		handleSetNextStream()
		handleSetTakePicture()
	}, [activeCameraId]);

	const handleSetNextStream = () => handleNextStream(activeCameraId, refStream, stream, setNextStream);
	const handleSetTakePicture = () => handleTakePicture(refStream, refServiceCanvas, stream, setPicture);

	const dimensions = stream ? stream.getTracks()[0].getSettings() : null;

	const drawBoundingRect = (ctx: CanvasRenderingContext2D, nextCoord: any) => {
		const x1 = mCoords[0];
		const y1 = mCoords[1]
		const w = nextCoord[0] - mCoords[0];
		const h = nextCoord[1] - mCoords[1];
		ctx.strokeStyle = '#3bff65';
		ctx.strokeRect(x1, y1, w, h);
	};

	const mouseDownMagnifHandler = (e: IMouseEvent) => {
		if (mCoords.length === 4 || !isCalibrationActive) return;
		const {canvas} = getCanvasAndContext(refMeasureCanvas);
		const nextCoord = getNextCoordinate(e, canvas);
		const newCoords = mCoords.concat(nextCoord);
		setNextMCoord(newCoords);
	};


	const mouseMoveMagnifHandler = (e: IMouseEvent) => {
		if (mCoords.length !== 2 || !isCalibrationActive) return;
		const {canvas, ctx} = getCanvasAndContext(refMeasureCanvas);
		const nextCoord = getNextCoordinate(e, canvas);
		if (!canvas || !ctx) return;
		clearCanvas(canvas);
		drawBoundingRect(ctx, nextCoord);
	}

	return (
		<div className={styles.wrapper}>
			<SubHeader bottomBorder>
				{ activeStep === 0 && <SettingsContainer /> }
				{ activeStep === 1 && <div>measurement</div> }
			</SubHeader>
			<div className={styles.outputWrapper}>
				<video
					ref={refStream}
					className={styles.video}
					style={{display: pictureLabel ? 'none' : 'flex', zIndex: 10}}
					onLoadedDataCapture={handleSetTakePicture}
					autoPlay
				/>
				{ 
					dimensions && (
						<canvas
							ref={refMeasureCanvas}
							className={styles.video}
							style={{zIndex: 100}}
							width={dimensions.width}
							height={dimensions.height}
							onMouseDown={mouseDownMagnifHandler}
							onMouseMove={mouseMoveMagnifHandler}
						/>
					)
				}
				<img
					ref={refPicture}
					className={styles.video}
					src={picture}
					crossOrigin='anonymous'
					alt=''
				/>
				<canvas ref={refPicureCanvas} style={{display: 'none'}} />
				<canvas ref={refServiceCanvas} style={{display: 'none'}} />
			</div>
		</div>
	);
};

export default Measurements;
