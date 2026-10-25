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
const next = data.events.find(e => e.is_next) || data.events.find(e => e.is_current);
const cur = data.events.find(e => e.is_current);
mkdirSync("data/gw", { recursive: true });
writeFileSync("data/players.json", JSON.stringify(players));
writeFileSync("data/fixtures.json", JSON.stringify(fx));
writeFileSync("data/meta.json", JSON.stringify({ id: next?.id, name: next?.name, deadline: next?.deadline_time, cur: cur?.id }));
if (cur) {
  const live = await get(`event/${cur.id}/live/`);
  writeFileSync(`data/gw/${cur.id}.json`, JSON.stringify(Object.fromEntries(live.elements.map(e => [e.id, e.stats.total_points]))));
}
console.log("saved", players.length, "players,", fx.length, "fixtures, gw", cur?.id);
