import React, { useEffect, useState } from "react";
import notificationIcon from "./images/FloodMate.png";
import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Label,
	LabelList,
	Legend,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

import "./App.css";

function App() {
	interface items {
		label: string;
		notation: string;
		id: string;
		RLOid: string;
		catchmentName: string;
		dateOpened: string;
		easting: number;
		lat: number;
		long: number;
		measures: measures[];
		northing: string;
		riverName: string;
		stageScale: string;
		stationReference: string;
		status: string;
		town: string;
		wiskilD: string;
	}
	interface measuresModel {
		measures: measures[];
	}
	interface chartData {
		dateTime: string;
		value: number;
	}

	interface measures {
		"@id": string;
		datumType: string;
		parameterName: string;
		label: string;
		latestReading: LatestReading;
		notation: string;
		parameter: string;
		period: number;
		qualifier: string;
		station: string;
		stationReference: string;
		unit: string;
		unitName: string;
		valueType: string;
	}
	interface LatestReading {
		id: string;
		date: string;
		dateTime: string;
		measure: string;
		value: number;
	}
	interface readings {
		"@id": string;
		dateTime: string;
		measure: string;
		value: number;
	}
	const [stationsRecords, setStationRecords] = useState([]);
	const [selectedStation, setSelectedStation] = useState("");
	const [measureReadings, setMeasureReading] = useState("");
	const [measureId, setMeasureId] = useState("");
	const [parameterName, setParameterName] = useState("");
	const [qualifier, setQualifier] = useState("");
	const [uniteName, setUnitName] = useState("");
	const [lineChartData, setChartData] = useState<chartData[]>([]);

	function findTime24HoursBeforeNow(): string {
		const currentDate = new Date();
		const time24HoursBeforeNow = new Date(
			currentDate.getTime() - 24.25 * 60 * 60 * 1000
		);
		return time24HoursBeforeNow.toISOString().replace(/\.\d{3}Z$/, "Z");
	}
	function getOnlyTimeFromISODate(date: string): string {
		if (!date) {
			throw new Error("No date provided");
		}

		const [year, month, day, ...time] = date.split(/[-T:]/);
		const [hour, minute, second] = time;

		return `${hour}:${minute}`;
	}

	useEffect(() => {
		fetch(
			"https://environment.data.gov.uk/flood-monitoring/id/stations?_limit=50"
		)
			.then((response) => response.json())
			.then((json) => setStationRecords(json && json.items))
			.catch((error) => console.error("Error:", error));
	}, []);

	useEffect(() => {
		selectedStation &&
			fetch(
				"https://environment.data.gov.uk/flood-monitoring/id/stations/" +
					selectedStation +
					"/measures"
			)
				.then((response) => response.json())
				.then((json) => json.items && getMeasurementDetails(json.items))
				.then(() => setMeasureReading(selectedStation))
				.catch((error) => console.error("Error:", error));
	}, [selectedStation]);
	useEffect(() => {
		measureReadings &&
			fetch(
				"https://environment.data.gov.uk/flood-monitoring/id/stations/" +
					selectedStation +
					"/readings.json?_sorted&since=" +
					findTime24HoursBeforeNow()
			)
				.then((response) => response.json())
				.then((json) => json.items && getMeasurementReading(json.items))
				.catch((error) => console.error("Error:", error));
	}, [measureReadings]);

	function getMeasurementDetails(data: measures[]) {
		console.log(data);
		data.map((measures: measures) => {
			setMeasureId(measures["@id"]);
			setParameterName(measures.parameterName);
			setQualifier(measures.qualifier);
			setUnitName(measures.unitName);
		});
	}

	function getMeasurementReading(data: readings[]) {
		let linechartData: chartData[] = [];

		data.map((readings: readings) => {
			if (readings.measure === measureId) {
				linechartData.push({
					dateTime: getOnlyTimeFromISODate(readings.dateTime),
					value: readings.value,
				});
			}
		});
		setChartData(linechartData);
		console.log("setchart data", lineChartData);
	}

	return (
		<div className="App">
			<div className="headerContainer">
				<img className="imgStyle" src={notificationIcon} alt="" />
				<h1 className="header"> Realtime Flood Monitoring App </h1>
				<select
					onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
						setSelectedStation(event.target.value);
					}}
					autoFocus={true}
					className="selectContainer"
					name="station name"
				>
					<option defaultValue={"select Station Name"}>
						Select Station Name{" "}
					</option>
					{stationsRecords.map(
						(items: items) =>
							items.status &&
							items.status.indexOf("statusActive") !== -1 && (
								<>
									<optgroup>
										<option className="optionContainer" value={items.notation}>
											{items.label}
										</option>
									</optgroup>
								</>
							)
					)}
				</select>
			</div>

			{selectedStation ? (
				<>
					<h1 className="station-container">
						{" "}
						{parameterName}-{qualifier}
					</h1>
					<div className="container">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart margin={{ left: 10, right: 10 }} data={lineChartData}>
								<Line
									animationDuration={1800}
									type="natural"
									dataKey="value"
									stroke="#eb4f57"
								/>
								<CartesianGrid strokeDasharray={"5"} stroke="#eb4f5774" />
								<XAxis
									angle={340}
									height={100}
									padding={{ left: 0, right: 0 }}
									tickLine={false}
									aria-label="dateTime"
									dataKey="dateTime"
									color="#1d84cd"
								>
									<Label
										spacing={0}
										value={parameterName + "-" + qualifier + " for 24 Hours"}
									/>
								</XAxis>
								<YAxis width={60} color="#1d84cd">
									<Label
										value="values"
										position="left"
										spacing={10}
										angle={-90}
										color="#1d84cd"
									/>
								</YAxis>
								<Legend verticalAlign="top" height={36} />
								<Tooltip />
								<YAxis />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</>
			) : (
				<>
					{" "}
					<div>
						{" "}
						<h1 className="errorContainer">
							{" "}
							404 Not Found Please select the Station Name :)
						</h1>
					</div>
				</>
			)}
		</div>
	);
}

export default App;
