/**
 * CodeMirror themes for the Milkdown Crepe editor.
 *
 * - Dark mode: reuses the built-in One Dark theme.
 * - Light mode: a custom "One Light" style inspired by Atom One Light,
 *   with vibrant, high-contrast token colors on a transparent background
 *   so it inherits the page's light surface.
 */
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { oneDark } from '@codemirror/theme-one-dark'

// ── One Light palette ──────────────────────────────────────────────
const mono1   = '#383a42' // default text
const mono2   = '#696c77' // secondary text
const mono3   = '#a0a1a7' // comments
const hue1    = '#0184bc' // cyan  – operators, regex
const hue2    = '#4078f2' // blue  – function names
const hue3    = '#a626a4' // purple – keywords
const hue4    = '#50a14f' // green – strings
const hue5    = '#e45649' // red   – property names, tags
const hue52   = '#ca1243' // dark red – headings
const hue6    = '#986801' // orange – numbers, constants
const hue6b   = '#c18401' // light orange – types, classes

const lightTheme = EditorView.theme({
  '&': {
    color: mono1,
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    caretColor: hue2,
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: hue2,
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#d7d8dc',
  },
  '.cm-panels': {
    backgroundColor: '#f0f0f0',
    color: mono1,
  },
  '.cm-searchMatch': {
    backgroundColor: '#ffdf5d66',
    outline: '1px solid #e2c55b',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#ffdf5d99',
  },
  '.cm-activeLine': {
    backgroundColor: '#f5f5f5',
  },
  '.cm-selectionMatch': {
    backgroundColor: '#e8e8e8',
  },
  '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: '#bad0f847',
    outline: '1px solid #c8c8c8',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: mono3,
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: mono2,
  },
  '.cm-tooltip': {
    border: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#e8e8e8',
      color: mono1,
    },
  },
}, { dark: false })

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword,
    color: hue3 },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName],
    color: hue5 },
  { tag: [tags.function(tags.variableName), tags.labelName],
    color: hue2 },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: hue6 },
  { tag: [tags.definition(tags.name), tags.separator],
    color: mono1 },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
    color: hue6b },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)],
    color: hue1 },
  { tag: [tags.meta, tags.comment],
    color: mono3,
    fontStyle: 'italic' },
  { tag: tags.strong,
    fontWeight: 'bold' },
  { tag: tags.emphasis,
    fontStyle: 'italic' },
  { tag: tags.strikethrough,
    textDecoration: 'line-through' },
  { tag: tags.link,
    color: hue1,
    textDecoration: 'underline' },
  { tag: tags.heading,
    fontWeight: 'bold',
    color: hue52 },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: hue6 },
  { tag: [tags.processingInstruction, tags.string, tags.inserted],
    color: hue4 },
  { tag: tags.invalid,
    color: '#ffffff',
    backgroundColor: hue5 },
  { tag: tags.variableName,
    color: mono1 },
])

export const oneLight = [lightTheme, syntaxHighlighting(lightHighlightStyle)]
export { oneDark }
