import React, { useEffect, useState } from "react";
import notificationIcon from "./images/FloodMate.png";
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
	interface measures {
		id: string;
		parameter: string;
		parameterName: string;
		period: string;
		qualifier: string;
		unitName: string;
	}
	const [stationsRecords, setStationRecords] = useState([]);
	const [selectedStation, setSelectedStation] = useState("");
	function findTime24HoursBeforeNow(): string {
		const currentDate = new Date();
		const time24HoursBeforeNow = new Date(
			currentDate.getTime() - 24.25 * 60 * 60 * 1000
		);
		return time24HoursBeforeNow.toISOString().replace(/\.\d{3}Z$/, "Z");
	}

	console.log(findTime24HoursBeforeNow());
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
				.then((json) => console.log(json))
				.catch((error) => console.error("Error:", error));
	}, [selectedStation]);

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
					{stationsRecords.map((items: items) => (
						<>
							<optgroup>
								<option className="optionContainer" value={items.notation}>
									{items.label}
								</option>
							</optgroup>
						</>
					))}
				</select>
				<div className="container"></div>
			</div>
		</div>
	);
}

export default App;
