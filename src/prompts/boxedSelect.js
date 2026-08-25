import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  makeTheme,
  isEnterKey,
  isUpKey,
  isDownKey,
} from '@inquirer/core';
import chalk from 'chalk';

function normalizeChoices(choices) {
  return choices.map((choice) =>
    typeof choice === 'object' && choice !== null
      ? { name: choice.name ?? String(choice.value), value: choice.value }
      : { name: String(choice), value: choice }
  );
}

const POINTER = '❯';
const BULLET_ACTIVE = '●';
const BULLET_IDLE = '○';

export default createPrompt((config, done) => {
  const theme = makeTheme(config.theme);
  const items = normalizeChoices(config.choices);
  const [status, setStatus] = useState('idle');
  const [active, setActive] = useState(0);
  const prefix = usePrefix({ status, theme });

  useKeypress((key) => {
    if (isEnterKey(key)) {
      setStatus('done');
      done(items[active].value);
    } else if (isUpKey(key)) {
      setActive((active - 1 + items.length) % items.length);
    } else if (isDownKey(key)) {
      setActive((active + 1) % items.length);
    }
  });

  const message = theme.style.message(config.message, status);

  if (status === 'done') {
    return `${prefix} ${message} ${theme.style.answer(items[active].name)}`;
  }

  function stripLength(text) {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, '').length;
  }

  const HEADER = 'Option';
  const innerWidth = Math.max(HEADER.length, ...items.map((item) => item.name.length + 4));

  const border = (left, fill, right) => `${left}${fill.repeat(innerWidth + 2)}${right}`;
  const padRow = (raw) => `${raw}${' '.repeat(Math.max(0, innerWidth - stripLength(raw)))}`;
  const row = (content) => `│ ${padRow(content)} │`;

  const lines = [
    chalk.gray(border('╭', '─', '╮')),
    row(chalk.bold(HEADER)),
    chalk.gray(border('├', '─', '┤')),
    ...items.map((item, index) => {
      const isActive = index === active;
      const bullet = isActive ? chalk.cyan(BULLET_ACTIVE) : chalk.gray(BULLET_IDLE);
      const pointer = isActive ? chalk.cyan(POINTER) : ' ';
      const label = isActive ? chalk.cyan.bold(item.name) : chalk.white(item.name);
      return row(`${pointer} ${bullet} ${label}`);
    }),
    chalk.gray(border('╰', '─', '╯')),
    chalk.dim('  ↑↓ move • enter to select • esc to quit'),
  ];

  return `${prefix} ${message}\n${lines.join('\n')}`;
});
