// Small coloured label. <Pill value="Present" /> picks the colour automatically.
const styles = {
  green: 'bg-brand-50 text-brand-700',
  gold: 'bg-gold-400/20 text-gold-600',
  clay: 'bg-clay-50 text-clay-600',
  grey: 'bg-ink/5 text-ink-soft',
};
const map = {
  Present: 'green', Active: 'green', A: 'green', B: 'green', admin: 'green',
  Late: 'gold', C: 'gold', D: 'gold', Graduated: 'gold', teacher: 'gold',
  Absent: 'clay', E: 'clay', F: 'clay', Inactive: 'clay',
};
export default function Pill({ value, tone, label }) {
  if (!value) return null;
  return <span className={`pill ${styles[tone || map[value] || 'grey']}`}>{label ?? value}</span>;
}
