import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePreview, collect, esc } from '../tools/generate-preview.js';
import { resolveColors } from '../tools/resolve.js';
import { listBrands } from '../tools/load.js';
import { CONTRAST_PAIRS } from '../tools/validate.js';

const html = generatePreview();

test('esc обезвреживает разметку', () => {
  assert.equal(esc('<a href="x">&</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
});

test('collect собирает все бренды и обе темы', () => {
  const d = collect();
  assert.deepEqual(d.brands, listBrands());
  for (const id of d.brands) {
    assert.ok(d.byBrand[id].colors.light['surface.content']);
    assert.ok(d.byBrand[id].colors.dark['surface.content']);
    assert.equal(d.byBrand[id].pairs.length, CONTRAST_PAIRS.length);
  }
});

test('заголовок стоит в начале файла, чтобы галерея его нашла', () => {
  assert.ok(html.indexOf('<title>') < 200);
  assert.match(html, /<title>Дизайн-система Aurora<\/title>/);
});

test('светлая палитра объявлена в голом :root', () => {
  // Классическая поломка артефакта — цвет, существующий только внутри
  // media-запроса: в незаштампованном состоянии он не применяется.
  const bare = /:root\{--content:([^;]+);/.exec(html);
  assert.ok(bare, 'нет голого :root с токенами');
  assert.equal(bare[1], resolveColors(listBrands()[0], 'light')['surface.content']);
});

test('тёмная тема покрывает все три состояния зрителя', () => {
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.match(html, /:root:not\(\[data-theme="light"\]\)\{/);
  assert.match(html, /:root\[data-theme="dark"\]\{/);
});

test('у каждого бренда своя пара палитр', () => {
  for (const id of listBrands().slice(1)) {
    assert.ok(html.includes(`:root[data-brand="${id}"]{`), `нет светлой палитры ${id}`);
    assert.ok(html.includes(`:root[data-theme="dark"][data-brand="${id}"]{`), `нет тёмной палитры ${id}`);
  }
});

test('body красит фон токеном, а не наследует чужой', () => {
  assert.match(html, /body\{[^}]*background:var\(--content\)/);
});

test('каждый семантический токен показан обеими темами', () => {
  for (const id of listBrands()) {
    const light = resolveColors(id, 'light');
    const dark = resolveColors(id, 'dark');
    for (const key of ['surface.content', 'text.primary', 'action.primary', 'status.offline']) {
      assert.ok(html.includes(light[key]), `${id}: нет светлого ${key}`);
      assert.ok(html.includes(dark[key]), `${id}: нет тёмного ${key}`);
    }
  }
});

test('измеренный контраст попадает на страницу для обоих брендов', () => {
  const d = collect();
  for (const id of d.brands) {
    const p = d.byBrand[id].pairs[0];
    assert.ok(html.includes(p.light.toFixed(2)), `${id}: нет значения ${p.light.toFixed(2)}`);
  }
});

test('превью объясняет общую типографику', () => {
  assert.ok(html.includes('Inter Tight') && html.includes('JetBrains Mono'));
});

test('страница не тянет ничего, кроме шрифтов Google', () => {
  const urls = html.match(/https?:\/\/[^"' )]+/g) ?? [];
  for (const u of urls) {
    assert.ok(
      u.startsWith('https://fonts.googleapis.com') || u.startsWith('https://fonts.gstatic.com'),
      `посторонний внешний ресурс: ${u}`,
    );
  }
});

test('теней нет и на самой странице', () => {
  // Кроме inset-полосы у выделенной строки — это не тень, а полоса.
  const shadows = html.match(/box-shadow:[^;}]+/g) ?? [];
  for (const s of shadows) {
    assert.ok(s.includes('inset'), `страница показывает систему без теней, но имеет ${s}`);
  }
});

test('экран «В деле» красится переменными страницы, а не hex светлой темы', () => {
  const demo = /<div class="demo">[\s\S]*?<div class="demo-total">/.exec(html)[0];
  assert.equal(/#[0-9A-F]{6}/i.test(demo), false, 'в демо-экране есть инлайновый hex, в тёмной теме он останется светлым');
  assert.match(demo, /var\(--track-speeding\)/);
  assert.match(demo, /var\(--moving\)/);
  assert.match(demo, /var\(--marker-fill\)/);
});

test('заливка геозон и scrim объявлены переменными в обеих темах', () => {
  assert.match(html, /:root\{[^}]*--scrim:#[0-9A-F]{8}/);
  assert.match(html, /:root\{[^}]*--geofence-aqua:#00FFFF40/);
  assert.match(html, /:root\[data-theme="dark"\]\{[^}]*--geofence-aqua:#00FFFF59/);
});

test('кривая движения в превью выведена из токена, а не набрана руками', () => {
  assert.match(html, /transition:transform 180ms cubic-bezier\(\.215,\.61,\.355,1\)/);
});

test('хром карты показан отдельной группой с пометкой, что тема и бренд его не трогают', () => {
  assert.match(html, /<tr class="grp"><td colspan="3">Хром карты · один во всех темах и брендах<\/td><\/tr>/);
  for (const key of ['map.controlFill', 'map.controlBorder', 'map.controlDivider', 'map.controlInk', 'map.attributionInk']) {
    assert.ok(html.includes(`<td class="tok">${key}</td>`), `нет строки ${key}`);
  }
});

test('превью показывает новые чернила отдельно от заливок', () => {
  for (const key of ['action.text', 'text.onSolid']) {
    assert.ok(html.includes(`<td class="tok">${key}</td>`), `нет строки ${key}`);
  }
});

test('различимость треков посчитана для каждого бренда и показана', () => {
  const d = collect();
  for (const id of d.brands) {
    const t = d.byBrand[id].trackDistinction;
    assert.ok(html.includes(t.light.toFixed(2)), `${id}: нет значения ${t.light.toFixed(2)}`);
  }
  // У МТС оба трека красные: это и есть открытый вопрос, ради которого число меряется.
  assert.ok(d.byBrand.mts.trackDistinction.light < 1.5);
});
