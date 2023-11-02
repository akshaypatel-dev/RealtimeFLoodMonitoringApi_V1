import React, { useEffect, useState } from "react";
import notificationIcon from "./images/Notification Bell Badge Logo.png";
import "./App.css";

function App() {
	interface stationModel {
		items: items[];
	}
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
	useEffect(() => {
		fetch(
			"https://environment.data.gov.uk/flood-monitoring/id/stations?_limit=50"
		)
			.then((response) => response.json())
			.then((json) => setStationRecords(json && json.items))
			.catch((error) => console.error("Error:", error));
	}, []);
	const label = stationsRecords.map((items: items) => items.catchmentName);

	return (
		<div className="App">
			<div className="headerContainer">
				<img className="imgStyle" src={notificationIcon} alt="" />
				<h1 className="header"> Welcome to Realtime Flood Monitoring App </h1>
				<select className="selectContainer" name="station name" id="">
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
			</div>
		</div>
	);
}

export default App;
