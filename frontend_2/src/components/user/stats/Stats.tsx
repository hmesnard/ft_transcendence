import React from "react";

interface iStats {
	gamesWon: number;
	gamesLost: number;
}


class Stats extends React.Component<{gamesWon: number, gamesLost: number}, iStats> {
	constructor({gamesWon, gamesLost}: {gamesWon: number, gamesLost: number}) {
		super({gamesWon, gamesLost});
	}

	render() {
		return (
			<div>
				<h1>Stats</h1>
				<p>Games won: {this.props.gamesWon}</p>
				<p>Games lost: {this.props.gamesLost}</p>
			</div>
		);
	}
}

export default Stats;