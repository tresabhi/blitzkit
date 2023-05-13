import markdownEscape from 'markdown-escape';

export default function resolveTankName(tank: {
  tank_id: number;
  name?: string;
}) {
  return tank.name ? markdownEscape(tank.name) : `Unknown Tank ${tank.tank_id}`;
}
