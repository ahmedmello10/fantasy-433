import { writeFileSync, mkdirSync } from "fs";
const base = "https://fantasy.premierleague.com/api/";
const get = async p => (await fetch(base + p)).json();
const data = await get("bootstrap-static/");
const teams = Object.fromEntries(data.teams.map(t => [t.id, t.name]));
const tc = Object.fromEntries(data.teams.map(t => [t.id, t.code]));
const pos = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const players = data.elements.map(p => ({
  id: p.id, code: p.code, name: p.web_name, team: teams[p.team], tcode: tc[p.team],
  pos: pos[p.element_type], price: p.now_cost / 10, points: p.total_points,
  gw: p.event_points, ppg: Number(p.points_per_game), status: p.status
}));
const fx = (await get("fixtures/")).map(f => ({
  round: f.event, kickoff: f.kickoff_time, home: teams[f.team_h], away: teams[f.team_a],
  hc: tc[f.team_h], ac: tc[f.team_a], homeScore: f.team_h_score, awayScore: f.team_a_score, finished: f.finished
}));
const ev = data.events.find(e => e.is_next) || data.events.find(e => e.is_current);
mkdirSync("data", { recursive: true });
writeFileSync("data/players.json", JSON.stringify(players));
writeFileSync("data/fixtures.json", JSON.stringify(fx));
writeFileSync("data/meta.json", JSON.stringify({ id: ev?.id, name: ev?.name, deadline: ev?.deadline_time }));
console.log("saved", players.length, "players,", fx.length, "fixtures");
