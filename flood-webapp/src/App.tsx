import React, { useEffect, useState } from "react";
import notificationIcon from "./images/FloodMate.png";
import FloodMate from "./images/8570.jpg";
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
	AreaChart,
	Area,
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
							<AreaChart margin={{ left: 10, right: 10 }} data={lineChartData}>
								<defs>
									<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
										<stop offset="10%" stopColor="#eb4f57" stopOpacity={0.9} />
										<stop offset="85%" stopColor="#1d84cd" stopOpacity={0.9} />
									</linearGradient>
									<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#eb4f57" stopOpacity={0.8} />
										<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray={"5"} stroke="#4a81d1" />

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
								<Area
									type="monotone"
									dataKey="value"
									stroke="#4a81d1"
									fillOpacity={1}
									fill="url(#colorUv)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</>
			) : (
				<>
					{" "}
					<div className="errorContainer">
						{" "}
						<div className="errorMain">
							<h1 className="errorHeader"> Welcome to Flood Mate </h1>
							<p className="errorDesc">
								Our Flood Monitoring App offers a user-friendly interface for
								accessing real-time flood monitoring data based on stations. It
								is specifically designed to cater to the needs of the residents
								and communities in flood-prone areas.
							</p>
							<ul className="subError">
								<li>
									<b>Real-time Data: </b> The app displays live flood monitoring
									data, enabling users to stay informed about the current status
									of their location.
								</li>

								<li>
									<b>Historical Data: </b> The app provides access to historical
									flood data, allowing users to analyze trends and identify
									potential areas of concern. Interactive Maps: Users can
									interact with the app's interactive maps to visualize flood
									monitoring data in their location.
								</li>
								<li>
									<b>Weather Information:</b> The app integrates weather data,
									allowing users to view the current weather conditions in their
									area and assess potential flood risks.
								</li>
								<li>
									{" "}
									<b>Personalized Alerts:</b> Users can set up personalized
									flood alerts based on their location and preferred alerting
									method (e.g., email, SMS, or push notifications).
								</li>
								<li>
									<b> Emergency Services: </b> The app offers easy access to
									emergency services contact information, enabling users to get
									help quickly during a flood emergency.
								</li>
								<li>
									<b> Educational Content: </b>The app features informative
									educational content on flood prevention, preparedness, and
									risk management, helping users make informed decisions about
									their safety and well-being.
								</li>
							</ul>
						</div>
						<div className="imgMain">
							<img src={FloodMate} alt="image that contain flood details" />
						</div>
					</div>
				</>
			)}
			<footer className="FooterContainer">
				{" "}
				<p className="footer-content">More Features Coming soon...</p>{" "}
			</footer>
		</div>
	);
}

export default App;
