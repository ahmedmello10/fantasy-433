import { writeFileSync, mkdirSync } from "fs";
const base = "https://fantasy.premierleague.com/api/";
const get = async p => (await fetch(base + p)).json();
const data = await get("bootstrap-static/");
const teams = Object.fromEntries(data.teams.map(t => [t.id, t.name]));
const pos = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const players = data.elements.map(p => ({
  id: p.id, name: p.web_name, team: teams[p.team], pos: pos[p.element_type],
  price: p.now_cost / 10, points: p.total_points, gw: p.event_points,
  ppg: Number(p.points_per_game), status: p.status
}));
const fx = (await get("fixtures/")).map(f => ({
  round: f.event, kickoff: f.kickoff_time, home: teams[f.team_h], away: teams[f.team_a],
  homeScore: f.team_h_score, awayScore: f.team_a_score, finished: f.finished
}));
mkdirSync("data", { recursive: true });
writeFileSync("data/players.json", JSON.stringify(players));
writeFileSync("data/fixtures.json", JSON.stringify(fx));
console.log("saved", players.length, "players,", fx.length, "fixtures");
